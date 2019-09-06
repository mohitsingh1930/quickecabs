-- MySQL dump 10.13  Distrib 8.0.15, for Win64 (x86_64)
--
-- Host: localhost    Database: quickecabs
-- ------------------------------------------------------
-- Server version	8.0.15

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8mb4 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `name` varchar(20) DEFAULT NULL,
  `password` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `bookings` (
  `Id` varchar(15) NOT NULL,
  `confirmation_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `user_mail` varchar(80) DEFAULT NULL,
  `user_name` varchar(30) DEFAULT NULL,
  `name` varchar(20) DEFAULT NULL,
  `car_number` varchar(15) DEFAULT NULL,
  `fare` int(11) DEFAULT NULL,
  `destination_from` varchar(256) DEFAULT NULL,
  `destination_to` varchar(256) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `journey` enum('one-way','round-trip') DEFAULT NULL,
  `end` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES ('201908315137837','2019-08-31 10:56:03','mohitsingh1930@gmail.com','Mohit Singh','Force Traveller','undefined',14800,'Burari, Delhi, India','Dehradun, Uttarakhand, India','2019-08-31 21:30:00','2019-08-31 21:30:00','one-way',0),('201909018afaf42','2019-08-31 11:00:30','mohitsingh1930@gmail.com','Mohit Singh','Innova','DL 455 9087',9000,'Burari, Delhi, India','Amarnath Temple Road, Beltola Tiniali, Guwahati, Assam, India','2019-09-01 10:58:00','2019-09-03 10:58:00','round-trip',0);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fares`
--

DROP TABLE IF EXISTS `fares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `fares` (
  `name` varchar(30) NOT NULL,
  `outstation` int(11) DEFAULT NULL,
  `outstation_extra` int(11) DEFAULT NULL,
  `local` int(11) DEFAULT NULL,
  `local_extra_km` int(11) DEFAULT NULL,
  `local_extra_hrs` int(11) DEFAULT NULL,
  `driver` int(11) DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fares`
--

LOCK TABLES `fares` WRITE;
/*!40000 ALTER TABLE `fares` DISABLE KEYS */;
INSERT INTO `fares` VALUES ('Dzire',2900,11,1600,13,130,300),('Etios',2900,11,1600,13,130,300),('Force Traveller',7000,25,4700,30,350,400),('Indigo',2900,11,1600,13,130,300),('Innova',4200,13,2200,18,180,300),('Innova crysta',4500,15,2400,20,180,300),('Toyota Corolla',6000,20,3700,25,350,400);
/*!40000 ALTER TABLE `fares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `our_users`
--

DROP TABLE IF EXISTS `our_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `our_users` (
  `email` varchar(320) DEFAULT NULL,
  `name` varchar(20) DEFAULT NULL,
  `password` varchar(64) NOT NULL,
  `user_id` int(10) NOT NULL AUTO_INCREMENT,
  `active` tinyint(1) DEFAULT NULL,
  `validateToken` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `our_users`
--

LOCK TABLES `our_users` WRITE;
/*!40000 ALTER TABLE `our_users` DISABLE KEYS */;
INSERT INTO `our_users` VALUES ('rohitpra.d16@gmail.com','Rohit Prajapati','$2b$10$Ff2J8El.Oy4Do9Nli6CgUeE6gMxxWN3cAYCzY1c6ZFH4QQly130Xu',2,1,''),('na64565427@gmail.com','Aman Chauhan','$2b$10$nCzC5gdFURA2mf2/Ti4zleffcw895WIPhHnldxsZbqIMD2GD5/FNK',3,1,'896933'),('mohitsingh1930@gmail.com','Mohit Singh','$2b$10$TIZU2HU/DNP4siRFccHrveHt7KrDSo8.6j4W2IlTJ2DxIwHpEV4N2',5,1,'');
/*!40000 ALTER TABLE `our_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pending_bookings`
--

DROP TABLE IF EXISTS `pending_bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `pending_bookings` (
  `Id` varchar(15) NOT NULL,
  `user_mail` varchar(80) DEFAULT NULL,
  `user_name` varchar(30) DEFAULT NULL,
  `name` varchar(30) DEFAULT NULL,
  `fare` int(11) DEFAULT NULL,
  `destination_from` varchar(256) DEFAULT NULL,
  `destination_to` varchar(256) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `journey` enum('one-way','round-trip') DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pending_bookings`
--

LOCK TABLES `pending_bookings` WRITE;
/*!40000 ALTER TABLE `pending_bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `pending_bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ride_info`
--

DROP TABLE IF EXISTS `ride_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `ride_info` (
  `Id` varchar(15) NOT NULL,
  `car_fare` int(11) DEFAULT NULL,
  `driver_fare` int(11) DEFAULT NULL,
  `distance` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ride_info`
--

LOCK TABLES `ride_info` WRITE;
/*!40000 ALTER TABLE `ride_info` DISABLE KEYS */;
/*!40000 ALTER TABLE `ride_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transports`
--

DROP TABLE IF EXISTS `transports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `transports` (
  `name` varchar(30) NOT NULL,
  `availability` tinyint(1) NOT NULL DEFAULT '1',
  `seats` int(11) DEFAULT NULL,
  `img` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transports`
--

LOCK TABLES `transports` WRITE;
/*!40000 ALTER TABLE `transports` DISABLE KEYS */;
INSERT INTO `transports` VALUES ('Dzire',0,4,'dzire.png'),('Etios',0,4,'etios.png'),('Force Traveller',1,15,'traveller.png'),('Indigo',0,4,'indigo.png'),('Innova',1,6,'innova.png'),('Innova crysta',0,7,'innova_crysta.png'),('Toyota Corolla',1,4,'toyota_corolla.png');
/*!40000 ALTER TABLE `transports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `users` (
  `email` varchar(320) NOT NULL,
  `name` varchar(30) NOT NULL,
  `mob` varchar(15) DEFAULT NULL,
  `current_booking` int(11) DEFAULT NULL,
  PRIMARY KEY (`email`),
  UNIQUE KEY `mob` (`mob`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-09-06  9:40:35
