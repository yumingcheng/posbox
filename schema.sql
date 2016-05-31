-- Copyright 2009 FriendFeed
--
-- Licensed under the Apache License, Version 2.0 (the "License"); you may
-- not use this file except in compliance with the License. You may obtain
-- a copy of the License at
--
--     http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
-- WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
-- License for the specific language governing permissions and limitations
-- under the License.

-- To create the database:
--   CREATE DATABASE posbox;
-- To reload the tables:
--   mysql --user=root --password=root --database=posbox < schema.sql
-- SET SESSION storage_engine = "InnoDB";


SET SESSION time_zone = "+8:00";
ALTER DATABASE CHARACTER SET "utf8";

DROP TABLE IF EXISTS vips;
CREATE TABLE vips (
    cardnumber VARCHAR(100) NOT NULL UNIQUE PRIMARY KEY,
    name VARCHAR(100) DEFAULT NULL,
    phonenumber VARCHAR(50)  DEFAULT NULL,
    points int(16) NOT NULL DEFAULT 0,
    sex TINYINT(1) not null DEFAULT 0 comment '0:男 1：女',
    updated TIMESTAMP NOT NULL
);

DROP TABLE IF EXISTS goods;
CREATE TABLE goods (
    barcode VARCHAR(100) NOT NULL UNIQUE PRIMARY KEY,
    brand VARCHAR(512) NOT NULL,
    name VARCHAR(512) NOT NULL,
    spec VARCHAR(512) NOT NULL,
    classify VARCHAR(512) NOT NULL,
    updated TIMESTAMP NOT NULL,
    num INT(11) DEFAULT 0,
    price DOUBLE DEFAULT 0.0,
    costprice DOUBLE DEFAULT 0.0
);

DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cardnumber VARCHAR(100),
    sale_price DOUBLE NOT NULL,
    list_price DOUBLE NOT NULL,
    saving DOUBLE NOT NULL DEFAULT 0.0,
    ordertime DATETIME NOT NULL
);

DROP TABLE IF EXISTS order_detail;
CREATE TABLE order_detail (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    orderid INT NOT NULL,
    barcode VARCHAR(100) NOT NULL,
    discount INT(10) DEFAULT 100,
    sale_price DOUBLE NOT NULL,
    sale_num INT(10) DEFAULT 1
);
