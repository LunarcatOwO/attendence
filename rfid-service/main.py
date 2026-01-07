#!/usr/bin/env python3
"""
Main RFID and LCD Service for Attendance Tracker
Handles RFID card reading and LCD display on Raspberry Pi 4
"""

import os
import sys
import time
import signal
import requests
from datetime import datetime
from rfid_reader import RFIDReader
from lcd_display import LCDDisplay

# Configuration from environment variables
API_URL = os.getenv('API_URL', 'http://localhost:3000')
API_TOKEN = os.getenv('API_TOKEN', '')
LCD_I2C_ADDRESS = int(os.getenv('LCD_I2C_ADDRESS', '0x27'), 16)
LCD_COLS = int(os.getenv('LCD_COLS', '16'))
LCD_ROWS = int(os.getenv('LCD_ROWS', '2'))

class AttendanceSystem:
    def __init__(self):
        self.running = True
        self.rfid_reader = None
        self.lcd = None
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
    def signal_handler(self, sig, frame):
        """Handle shutdown signals"""
        print("\nShutting down gracefully...")
        self.running = False
        
    def initialize(self):
        """Initialize RFID reader and LCD display"""
        try:
            print("Initializing RFID reader...")
            self.rfid_reader = RFIDReader()
            print("✓ RFID reader initialized")
            
            print("Initializing LCD display...")
            self.lcd = LCDDisplay(
                i2c_address=LCD_I2C_ADDRESS,
                cols=LCD_COLS,
                rows=LCD_ROWS
            )
            print("✓ LCD display initialized")
            
            # Display startup message
            self.lcd.clear()
            self.lcd.write("Attendance", line=0)
            self.lcd.write("System Ready", line=1)
            time.sleep(2)
            
            # Display waiting message
            self.lcd.clear()
            self.lcd.write("Scan RFID Card", line=0)
            self.lcd.write("Please Wait...", line=1)
            
            return True
            
        except Exception as e:
            print(f"✗ Initialization error: {e}")
            return False
    
    def check_backend_connection(self):
        """Check if backend API is reachable"""
        try:
            response = requests.get(
                f"{API_URL}/health",
                timeout=5
            )
            return response.status_code == 200
        except:
            return False
    
    def process_rfid(self, rfid_key):
        """Process RFID card scan and update attendance"""
        try:
            # Display processing message
            self.lcd.clear()
            self.lcd.write("Processing...", line=0)
            self.lcd.write(f"ID: {rfid_key}", line=1)
            
            # Check if user exists
            user_response = requests.get(
                f"{API_URL}/api/users",
                params={'rfidKey': rfid_key},
                headers={'X-API-Token': API_TOKEN},
                timeout=10
            )
            
            if user_response.status_code != 200:
                self.display_error("User Not Found")
                return
            
            user_data = user_response.json()
            if not user_data.get('success'):
                self.display_error("User Not Found")
                return
            
            user = user_data.get('data', {})
            user_name = user.get('name', 'Unknown')
            is_logged_in = user.get('loggedIn') == 1
            
            # Sign in or sign out based on current status
            if is_logged_in:
                # Sign out
                response = requests.post(
                    f"{API_URL}/api/attendance/sign-out",
                    json={'rfidKey': rfid_key},
                    headers={
                        'X-API-Token': API_TOKEN,
                        'Content-Type': 'application/json'
                    },
                    timeout=10
                )
            else:
                # Sign in
                response = requests.post(
                    f"{API_URL}/api/attendance/sign-in",
                    json={'rfidKey': rfid_key},
                    headers={
                        'X-API-Token': API_TOKEN,
                        'Content-Type': 'application/json'
                    },
                    timeout=10
                )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    if is_logged_in:
                        self.display_success(f"{user_name}", "Signed Out")
                    else:
                        self.display_success(f"{user_name}", "Signed In")
                else:
                    self.display_error(result.get('message', 'Error'))
            else:
                self.display_error("Server Error")
                
        except requests.exceptions.Timeout:
            self.display_error("Connection Timeout")
        except requests.exceptions.ConnectionError:
            self.display_error("No Connection")
        except Exception as e:
            print(f"Error processing RFID: {e}")
            self.display_error("System Error")
    
    def display_success(self, line1, line2):
        """Display success message on LCD"""
        self.lcd.clear()
        self.lcd.write(line1[:LCD_COLS], line=0)
        self.lcd.write(line2[:LCD_COLS], line=1)
        time.sleep(3)
        
        # Return to ready state
        self.lcd.clear()
        self.lcd.write("Scan RFID Card", line=0)
        self.lcd.write("Ready...", line=1)
    
    def display_error(self, message):
        """Display error message on LCD"""
        self.lcd.clear()
        self.lcd.write("ERROR!", line=0)
        self.lcd.write(message[:LCD_COLS], line=1)
        time.sleep(3)
        
        # Return to ready state
        self.lcd.clear()
        self.lcd.write("Scan RFID Card", line=0)
        self.lcd.write("Ready...", line=1)
    
    def run(self):
        """Main application loop"""
        if not self.initialize():
            print("Failed to initialize. Exiting...")
            return 1
        
        print("Attendance system running...")
        print("Waiting for RFID cards...")
        
        # Wait for backend to be ready
        while self.running and not self.check_backend_connection():
            print("Waiting for backend API...")
            self.lcd.clear()
            self.lcd.write("Connecting to", line=0)
            self.lcd.write("Server...", line=1)
            time.sleep(5)
        
        if not self.running:
            return 0
        
        print("✓ Backend connected")
        self.lcd.clear()
        self.lcd.write("Scan RFID Card", line=0)
        self.lcd.write("Ready...", line=1)
        
        last_rfid = None
        last_scan_time = 0
        
        # Main loop
        while self.running:
            try:
                # Read RFID card
                rfid_key = self.rfid_reader.read()
                
                if rfid_key:
                    current_time = time.time()
                    
                    # Prevent duplicate scans within 3 seconds
                    if rfid_key != last_rfid or (current_time - last_scan_time) > 3:
                        print(f"RFID detected: {rfid_key}")
                        self.process_rfid(rfid_key)
                        last_rfid = rfid_key
                        last_scan_time = current_time
                
                # Small delay to prevent CPU overuse
                time.sleep(0.1)
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"Error in main loop: {e}")
                time.sleep(1)
        
        # Cleanup
        print("Cleaning up...")
        if self.lcd:
            self.lcd.clear()
            self.lcd.write("System", line=0)
            self.lcd.write("Shutting Down", line=1)
            time.sleep(1)
            self.lcd.close()
        
        if self.rfid_reader:
            self.rfid_reader.close()
        
        print("Goodbye!")
        return 0

def main():
    """Entry point"""
    system = AttendanceSystem()
    return system.run()

if __name__ == '__main__':
    sys.exit(main())
