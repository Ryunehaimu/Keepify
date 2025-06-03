-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 02, 2025 at 05:08 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `keepify_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `storage_item_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `checklists`
--

CREATE TABLE `checklists` (
  `id` int(11) NOT NULL,
  `storage_item_id` int(11) NOT NULL,
  `type` enum('pickup','return') NOT NULL,
  `admin_id` int(11) NOT NULL,
  `items_complete` tinyint(1) DEFAULT 0,
  `condition_verified` tinyint(1) DEFAULT 0,
  `photos_taken` tinyint(1) DEFAULT 0,
  `signature_captured` tinyint(1) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `completed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `digital_signatures`
--

CREATE TABLE `digital_signatures` (
  `id` int(11) NOT NULL,
  `storage_item_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `type` enum('agreement','pickup','return') NOT NULL,
  `user_signature_path` varchar(500) DEFAULT NULL,
  `admin_signature_path` varchar(500) DEFAULT NULL,
  `agreement_text` text DEFAULT NULL,
  `signed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `item_details`
--

CREATE TABLE `item_details` (
  `id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `itemName` varchar(255) NOT NULL,
  `conditionNotes` text DEFAULT NULL,
  `estimatedValue` decimal(10,2) DEFAULT NULL,
  `storageItemId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `monitoring_photos`
--

CREATE TABLE `monitoring_photos` (
  `id` int(11) NOT NULL,
  `monitoring_record_id` int(11) NOT NULL,
  `photo_path` varchar(500) NOT NULL,
  `caption` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `monitoring_records`
--

CREATE TABLE `monitoring_records` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `conditionStatus` enum('excellent','good','fair','poor') NOT NULL DEFAULT 'good',
  `storageItemId` int(11) NOT NULL,
  `adminId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('pickup_scheduled','monitoring_update','ready_pickup','general') DEFAULT 'general',
  `is_read` tinyint(1) DEFAULT 0,
  `related_item_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `storage_items`
--

CREATE TABLE `storage_items` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','picked_up','stored','ready_pickup','returned','cancelled') NOT NULL DEFAULT 'pending',
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `estimatedValue` decimal(12,2) DEFAULT NULL,
  `durationDays` int(11) NOT NULL,
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `monitoringEnabled` tinyint(4) NOT NULL DEFAULT 0,
  `monitoringFrequency` enum('3_days','1_week') NOT NULL DEFAULT '1_week',
  `allowChecking` tinyint(4) NOT NULL DEFAULT 1,
  `pickupAddress` text DEFAULT NULL,
  `pickupDate` datetime DEFAULT NULL,
  `pickupNotes` text DEFAULT NULL,
  `userId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `isActive` tinyint(4) NOT NULL DEFAULT 1,
  `phone` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `address`, `role`, `createdAt`, `updatedAt`, `firstName`, `lastName`, `isActive`, `phone`) VALUES
(1, 'ryunehaimu007@gmail.com', '$2b$10$XUa.La2FO2oIZ53PWftVdO8jnb5UnvGHUUIC0sHWlmt6.5j.mw6FK', 'testtttt', 'user', '2025-06-02 21:29:00.497163', '2025-06-02 21:29:00.497163', 'Rasyid', 'Padang', 1, '089518368265');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_item_action` (`storage_item_id`,`action`),
  ADD KEY `idx_user_date` (`user_id`,`created_at`);

--
-- Indexes for table `checklists`
--
ALTER TABLE `checklists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `storage_item_id` (`storage_item_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `digital_signatures`
--
ALTER TABLE `digital_signatures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `storage_item_id` (`storage_item_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `item_details`
--
ALTER TABLE `item_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `monitoring_photos`
--
ALTER TABLE `monitoring_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `monitoring_record_id` (`monitoring_record_id`);

--
-- Indexes for table `monitoring_records`
--
ALTER TABLE `monitoring_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_42491c88a59d2cb22e8ff4e02a9` (`admin_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `related_item_id` (`related_item_id`),
  ADD KEY `idx_user_unread` (`user_id`,`is_read`);

--
-- Indexes for table `storage_items`
--
ALTER TABLE `storage_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_ae79fa599f01a03700dfeb09bd6` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `checklists`
--
ALTER TABLE `checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `digital_signatures`
--
ALTER TABLE `digital_signatures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `item_details`
--
ALTER TABLE `item_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `monitoring_photos`
--
ALTER TABLE `monitoring_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `monitoring_records`
--
ALTER TABLE `monitoring_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `storage_items`
--
ALTER TABLE `storage_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `activity_logs_ibfk_2` FOREIGN KEY (`storage_item_id`) REFERENCES `storage_items` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `checklists`
--
ALTER TABLE `checklists`
  ADD CONSTRAINT `checklists_ibfk_1` FOREIGN KEY (`storage_item_id`) REFERENCES `storage_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `checklists_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `digital_signatures`
--
ALTER TABLE `digital_signatures`
  ADD CONSTRAINT `digital_signatures_ibfk_1` FOREIGN KEY (`storage_item_id`) REFERENCES `storage_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `digital_signatures_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `digital_signatures_ibfk_3` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `monitoring_photos`
--
ALTER TABLE `monitoring_photos`
  ADD CONSTRAINT `monitoring_photos_ibfk_1` FOREIGN KEY (`monitoring_record_id`) REFERENCES `monitoring_records` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `monitoring_records`
--
ALTER TABLE `monitoring_records`
  ADD CONSTRAINT `FK_42491c88a59d2cb22e8ff4e02a9` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`related_item_id`) REFERENCES `storage_items` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `storage_items`
--
ALTER TABLE `storage_items`
  ADD CONSTRAINT `FK_ae79fa599f01a03700dfeb09bd6` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
