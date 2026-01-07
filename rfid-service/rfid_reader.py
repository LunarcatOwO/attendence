#!/usr/bin/env python3
"""
RFID Reader Module using MFRC522
Supports RC522 RFID readers on Raspberry Pi via SPI
"""

try:
    from mfrc522 import SimpleMFRC522
    import RPi.GPIO as GPIO
    HAS_HARDWARE = True
except ImportError:
    HAS_HARDWARE = False
    print("Warning: MFRC522 or RPi.GPIO not available. Running in simulation mode.")

class RFIDReader:
    def __init__(self):
        """Initialize the RFID reader"""
        self.reader = None
        
        if HAS_HARDWARE:
            try:
                GPIO.setwarnings(False)
                self.reader = SimpleMFRC522()
                print("✓ MFRC522 RFID reader initialized")
            except Exception as e:
                print(f"✗ Failed to initialize RFID reader: {e}")
                print("Running in simulation mode")
                self.reader = None
        else:
            print("Running in simulation mode (no hardware)")
    
    def read(self):
        """
        Read RFID card ID
        Returns: RFID key as string, or None if no card detected
        """
        if self.reader is None:
            # Simulation mode - return None (no card)
            return None
        
        try:
            # Non-blocking read with timeout
            rfid_id, text = self.reader.read_no_block()
            
            if rfid_id:
                # Convert to string and return
                return str(rfid_id)
            
            return None
            
        except Exception as e:
            print(f"Error reading RFID: {e}")
            return None
    
    def read_blocking(self):
        """
        Read RFID card ID (blocking)
        Waits until a card is detected
        Returns: RFID key as string
        """
        if self.reader is None:
            # Simulation mode - simulate reading a card
            import time
            time.sleep(1)
            return "1234567890"
        
        try:
            rfid_id, text = self.reader.read()
            return str(rfid_id)
        except Exception as e:
            print(f"Error reading RFID: {e}")
            return None
    
    def write(self, text):
        """
        Write text to RFID card
        Args:
            text: String to write to card
        Returns: True if successful, False otherwise
        """
        if self.reader is None:
            print("Cannot write in simulation mode")
            return False
        
        try:
            self.reader.write(text)
            return True
        except Exception as e:
            print(f"Error writing to RFID: {e}")
            return False
    
    def close(self):
        """Clean up GPIO resources"""
        if HAS_HARDWARE:
            try:
                GPIO.cleanup()
                print("✓ RFID reader cleaned up")
            except:
                pass

# Test code
if __name__ == '__main__':
    import time
    
    print("RFID Reader Test")
    print("Place an RFID card near the reader...")
    
    reader = RFIDReader()
    
    try:
        while True:
            rfid = reader.read()
            if rfid:
                print(f"Card detected: {rfid}")
                time.sleep(2)  # Prevent duplicate reads
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\nExiting...")
    finally:
        reader.close()
