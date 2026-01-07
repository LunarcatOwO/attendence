#!/usr/bin/env python3
"""
LCD Display Module using I2C
Supports 16x2 and 20x4 LCD displays with PCF8574 I2C backpack
"""

try:
    from RPLCD.i2c import CharLCD
    HAS_HARDWARE = True
except ImportError:
    HAS_HARDWARE = False
    print("Warning: RPLCD not available. Running in simulation mode.")

class LCDDisplay:
    def __init__(self, i2c_address=0x27, cols=16, rows=2):
        """
        Initialize the LCD display
        
        Args:
            i2c_address: I2C address of the LCD (default: 0x27)
            cols: Number of columns (default: 16)
            rows: Number of rows (default: 2)
        """
        self.cols = cols
        self.rows = rows
        self.lcd = None
        
        if HAS_HARDWARE:
            try:
                self.lcd = CharLCD(
                    i2c_expander='PCF8574',
                    address=i2c_address,
                    port=1,
                    cols=cols,
                    rows=rows,
                    dotsize=8,
                    charmap='A02',
                    auto_linebreaks=True
                )
                self.lcd.clear()
                print(f"✓ LCD {cols}x{rows} initialized at address {hex(i2c_address)}")
            except Exception as e:
                print(f"✗ Failed to initialize LCD: {e}")
                print("Running in simulation mode")
                self.lcd = None
        else:
            print("Running in simulation mode (no hardware)")
    
    def write(self, text, line=0):
        """
        Write text to a specific line
        
        Args:
            text: String to display
            line: Line number (0-based)
        """
        if line >= self.rows:
            print(f"Warning: Line {line} out of range (max: {self.rows - 1})")
            return
        
        # Pad or truncate text to fit column width
        text = str(text).ljust(self.cols)[:self.cols]
        
        if self.lcd:
            try:
                self.lcd.cursor_pos = (line, 0)
                self.lcd.write_string(text)
            except Exception as e:
                print(f"Error writing to LCD: {e}")
        else:
            # Simulation mode - print to console
            print(f"LCD Line {line}: {text}")
    
    def clear(self):
        """Clear the LCD display"""
        if self.lcd:
            try:
                self.lcd.clear()
            except Exception as e:
                print(f"Error clearing LCD: {e}")
        else:
            # Simulation mode
            print("LCD: [CLEAR]")
    
    def backlight(self, state):
        """
        Turn backlight on or off
        
        Args:
            state: True for on, False for off
        """
        if self.lcd:
            try:
                if state:
                    self.lcd.backlight_enabled = True
                else:
                    self.lcd.backlight_enabled = False
            except Exception as e:
                print(f"Error setting backlight: {e}")
        else:
            print(f"LCD Backlight: {'ON' if state else 'OFF'}")
    
    def display_centered(self, text, line=0):
        """
        Display text centered on a line
        
        Args:
            text: String to display
            line: Line number (0-based)
        """
        text = str(text)
        if len(text) > self.cols:
            text = text[:self.cols]
        
        padding = (self.cols - len(text)) // 2
        centered_text = ' ' * padding + text
        self.write(centered_text, line)
    
    def display_multiline(self, lines):
        """
        Display multiple lines of text
        
        Args:
            lines: List of strings, one per line
        """
        self.clear()
        for i, line in enumerate(lines[:self.rows]):
            self.write(line, i)
    
    def scroll_text(self, text, line=0, delay=0.3):
        """
        Scroll long text on a single line
        
        Args:
            text: String to scroll
            line: Line number (0-based)
            delay: Delay between scroll steps in seconds
        """
        import time
        
        if len(text) <= self.cols:
            self.write(text, line)
            return
        
        # Add padding
        text = text + ' ' * self.cols
        
        for i in range(len(text) - self.cols + 1):
            self.write(text[i:i + self.cols], line)
            time.sleep(delay)
    
    def create_custom_char(self, location, charmap):
        """
        Create a custom character
        
        Args:
            location: Character location (0-7)
            charmap: List of 8 integers (0-31) defining the character
        """
        if self.lcd:
            try:
                self.lcd.create_char(location, charmap)
            except Exception as e:
                print(f"Error creating custom character: {e}")
    
    def close(self):
        """Clean up resources"""
        if self.lcd:
            try:
                self.clear()
                self.lcd.close(clear=True)
                print("✓ LCD display closed")
            except Exception as e:
                print(f"Error closing LCD: {e}")

# Test code
if __name__ == '__main__':
    import time
    
    print("LCD Display Test")
    
    # Initialize LCD
    lcd = LCDDisplay(i2c_address=0x27, cols=16, rows=2)
    
    try:
        # Test 1: Basic write
        lcd.clear()
        lcd.write("Hello World!", line=0)
        lcd.write("LCD Test", line=1)
        time.sleep(2)
        
        # Test 2: Centered text
        lcd.clear()
        lcd.display_centered("Centered", line=0)
        lcd.display_centered("Text", line=1)
        time.sleep(2)
        
        # Test 3: Multiline
        lcd.display_multiline([
            "Line 1",
            "Line 2"
        ])
        time.sleep(2)
        
        # Test 4: Scrolling text (if text is long)
        lcd.clear()
        lcd.scroll_text("This is a very long scrolling text message", line=0, delay=0.2)
        
        lcd.clear()
        lcd.write("Test Complete", line=0)
        
    except KeyboardInterrupt:
        print("\nTest interrupted")
    finally:
        lcd.close()
