-- Create the attendance database
CREATE DATABASE IF NOT EXISTS attendance;
USE attendance;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `userId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(32) NOT NULL,
  `hours` DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `rfidKey` BIGINT UNSIGNED UNIQUE NOT NULL,
  `loggedIn` BOOLEAN NOT NULL DEFAULT 0,
  `lastLogin` DATETIME NOT NULL DEFAULT '2000-01-01 00:00:00',
  `lastLogout` DATETIME NOT NULL DEFAULT '2000-01-01 00:00:00',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`),
  INDEX idx_rfid (`rfidKey`),
  INDEX idx_logged_in (`loggedIn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Past seasons table
CREATE TABLE IF NOT EXISTS `pastseasons` (
  `seasonId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED NOT NULL,
  `hours` DECIMAL(10,2) UNSIGNED NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `seasonStartDate` DATE NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`seasonId`),
  INDEX idx_season_user (`userId`, `seasonStartDate`),
  INDEX idx_season_date (`seasonStartDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Records table for attendance logs
CREATE TABLE IF NOT EXISTS `records` (
  `recordId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED NOT NULL,
  `startTime` DATETIME NOT NULL,
  `endTime` DATETIME NOT NULL,
  `notes` VARCHAR(64) DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`recordId`),
  INDEX idx_user_time (`userId`, `startTime`),
  INDEX idx_time_range (`startTime`, `endTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing (optional)
-- INSERT INTO `users` (`name`, `hours`, `rfidKey`, `loggedIn`) 
-- VALUES ('Test User', 0.00, 1234567890, 0);
