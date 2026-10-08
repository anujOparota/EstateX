CREATE DATABASE project_temp;
USE project_temp;

-- ============================================================
-- TABLE DEFINITIONS
-- ============================================================

CREATE TABLE owner (
    owner_id     INT PRIMARY KEY AUTO_INCREMENT,
    owner_name   VARCHAR(100) NOT NULL,
    contact_no   VARCHAR(15)  NOT NULL UNIQUE,
    email        VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL DEFAULT ''
) AUTO_INCREMENT = 26000001;

CREATE TABLE agent (
    agent_id          INT PRIMARY KEY AUTO_INCREMENT,
    agent_name        VARCHAR(100) NOT NULL,
    contact_no        VARCHAR(15)  NOT NULL UNIQUE,
    email             VARCHAR(100) UNIQUE,
    password_hash     VARCHAR(255) NOT NULL DEFAULT '',
    rating            DECIMAL(3,2) DEFAULT 0.00,
    total_ratings     INT          DEFAULT 0,
    experience_years  INT          DEFAULT 0,
    bio               VARCHAR(300)
) AUTO_INCREMENT = 26100001;

CREATE TABLE buyer (
    buyer_id      INT PRIMARY KEY AUTO_INCREMENT,
    buyer_name    VARCHAR(100) NOT NULL,
    contact_no    VARCHAR(15)  NOT NULL UNIQUE,
    email         VARCHAR(100) UNIQUE,
    category      VARCHAR(10) CHECK(category IN ('buy', 'rent')),
    status        INT DEFAULT 0,
    password_hash VARCHAR(255) NOT NULL DEFAULT ''
) AUTO_INCREMENT = 26200001;

CREATE TABLE property_details (
    property_id          INT PRIMARY KEY AUTO_INCREMENT,
    address              VARCHAR(300) NOT NULL,
    city                 VARCHAR(50)  NOT NULL,
    date_listed          DATE         NOT NULL,
    year_of_construction INT          NOT NULL CHECK(year_of_construction > 0),
    no_of_bedrooms       INT          CHECK(no_of_bedrooms >= 0),
    size                 DECIMAL(10,2) CHECK(size > 0),
    owner_id             INT          NOT NULL,
    image_url            VARCHAR(500),
    status               ENUM('PENDING','ACTIVE','REJECTED') DEFAULT 'ACTIVE',
    FOREIGN KEY (owner_id) REFERENCES owner(owner_id) ON DELETE CASCADE
) AUTO_INCREMENT = 26300001;

CREATE TABLE property_for_sale (
    sale_id     INT PRIMARY KEY AUTO_INCREMENT,
    sale_date   DATE          DEFAULT NULL,
    sale_price  DECIMAL(12,2) NOT NULL CHECK(sale_price > 0),
    property_id INT           NOT NULL UNIQUE,
    agent_id    INT           NOT NULL,
    buyer_id    INT,
    FOREIGN KEY (property_id) REFERENCES property_details(property_id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id)    REFERENCES agent(agent_id),
    FOREIGN KEY (buyer_id)    REFERENCES buyer(buyer_id) ON DELETE SET NULL
) AUTO_INCREMENT = 26400001;

CREATE TABLE property_for_rent (
    rental_id    INT PRIMARY KEY AUTO_INCREMENT,
    start_date   DATE          DEFAULT NULL,
    end_date     DATE          DEFAULT NULL,
    rental_price DECIMAL(12,2) NOT NULL CHECK(rental_price > 0),
    property_id  INT           NOT NULL,
    agent_id     INT           NOT NULL,
    buyer_id     INT,
    FOREIGN KEY (property_id) REFERENCES property_details(property_id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id)    REFERENCES agent(agent_id),
    FOREIGN KEY (buyer_id)    REFERENCES buyer(buyer_id) ON DELETE SET NULL
) AUTO_INCREMENT = 26500001;

CREATE TABLE admin (
    admin_id      INT PRIMARY KEY AUTO_INCREMENT,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email         VARCHAR(100) UNIQUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buyer_requests (
    request_id   INT PRIMARY KEY AUTO_INCREMENT,
    buyer_id     INT NOT NULL,
    property_id  INT NOT NULL,
    agent_id     INT NOT NULL,
    request_type ENUM('buy','rent') NOT NULL,
    status       ENUM('PENDING','ACCEPTED','REJECTED','VISIT_SCHEDULED') DEFAULT 'PENDING',
    message      VARCHAR(500),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id)    REFERENCES buyer(buyer_id)               ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES property_details(property_id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id)    REFERENCES agent(agent_id)
) AUTO_INCREMENT = 26600001;


-- ============================================================
-- STORED PROCEDURES
-- ============================================================

DELIMITER //

CREATE PROCEDURE add_property(
    IN p_address  VARCHAR(300),
    IN p_city     VARCHAR(50),
    IN p_date_listed DATE,
    IN p_year     INT,
    IN p_bedrooms INT,
    IN p_size     DECIMAL(10,2),
    IN p_owner_id INT,
    IN p_type     VARCHAR(10),
    IN p_price    DECIMAL(12,2),
    IN p_agent_id INT
)
BEGIN
    DECLARE new_property_id INT;

    INSERT INTO property_details
        (address, city, date_listed, year_of_construction, no_of_bedrooms, size, owner_id)
    VALUES
        (p_address, p_city, p_date_listed, p_year, p_bedrooms, p_size, p_owner_id);

    SET new_property_id = LAST_INSERT_ID();

    IF p_type = 'sale' THEN
        INSERT INTO property_for_sale (sale_price, property_id, agent_id)
        VALUES (p_price, new_property_id, p_agent_id);
    ELSEIF p_type = 'rent' THEN
        INSERT INTO property_for_rent (rental_price, property_id, agent_id)
        VALUES (p_price, new_property_id, p_agent_id);
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid property type. Use sale or rent';
    END IF;
END //

CREATE PROCEDURE buy_property(
    IN p_property_id INT,
    IN p_buyer_id    INT
)
BEGIN
    DECLARE v_category VARCHAR(10);

    SELECT category INTO v_category FROM buyer WHERE buyer_id = p_buyer_id;

    IF v_category IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Buyer does not exist';
    END IF;
    IF v_category != 'buy' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Buyer is not eligible for buying';
    END IF;

    UPDATE property_for_sale
    SET buyer_id = p_buyer_id, sale_date = CURDATE()
    WHERE property_id = p_property_id;
END //

CREATE PROCEDURE rent_property(
    IN p_rental_id INT,
    IN p_buyer_id  INT
)
BEGIN
    DECLARE v_category VARCHAR(10);

    SELECT category INTO v_category FROM buyer WHERE buyer_id = p_buyer_id;

    IF v_category IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Buyer does not exist';
    END IF;
    IF v_category != 'rent' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Buyer is not eligible for renting';
    END IF;

    UPDATE property_for_rent
    SET buyer_id = p_buyer_id, start_date = CURDATE()
    WHERE rental_id = p_rental_id;
END //

CREATE PROCEDURE end_rent(IN p_rental_id INT)
BEGIN
    DECLARE v_property_id INT;
    DECLARE v_agent_id    INT;
    DECLARE v_price       DECIMAL(12,2);
    DECLARE v_buyer_id    INT;

    SELECT property_id, agent_id, rental_price, buyer_id
    INTO   v_property_id, v_agent_id, v_price, v_buyer_id
    FROM   property_for_rent
    WHERE  rental_id = p_rental_id;

    IF v_buyer_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Property is not yet rented';
    END IF;

    UPDATE property_for_rent SET end_date = CURDATE() WHERE rental_id = p_rental_id;

    INSERT INTO property_for_rent
        (property_id, agent_id, rental_price, buyer_id, start_date, end_date)
    VALUES
        (v_property_id, v_agent_id, v_price, NULL, NULL, NULL);
END //

CREATE PROCEDURE rate_agent(
    IN p_agent_id    INT,
    IN p_new_rating  DECIMAL(3,2)
)
BEGIN
    UPDATE agent
    SET total_ratings = total_ratings + 1,
        rating = ROUND(((rating * total_ratings) + p_new_rating) / (total_ratings + 1), 2)
    WHERE agent_id = p_agent_id;
END //

DELIMITER ;


-- ============================================================
-- TRIGGERS
-- ============================================================

DELIMITER //

CREATE TRIGGER trg_update_buyer_purchase
AFTER UPDATE ON property_for_sale
FOR EACH ROW
BEGIN
    IF OLD.buyer_id IS NULL AND NEW.buyer_id IS NOT NULL THEN
        UPDATE buyer SET status = status + 1 WHERE buyer_id = NEW.buyer_id;
    END IF;
END //

CREATE TRIGGER trg_rent_update
AFTER UPDATE ON property_for_rent
FOR EACH ROW
BEGIN
    IF OLD.buyer_id IS NULL AND NEW.buyer_id IS NOT NULL THEN
        UPDATE buyer SET status = status + 1 WHERE buyer_id = NEW.buyer_id;
    END IF;
    IF OLD.end_date IS NULL AND NEW.end_date IS NOT NULL THEN
        UPDATE buyer SET status = status - 1 WHERE buyer_id = NEW.buyer_id;
    END IF;
END //

DELIMITER ;
