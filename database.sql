CREATE TABLE IF NOT EXISTS users (
  userId   INT AUTO_INCREMENT PRIMARY KEY,
  email    VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  type     VARCHAR(50)  NOT NULL DEFAULT 'user',
  active   TINYINT(1)   NOT NULL DEFAULT 1
);

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS addUser(
  IN p_email    VARCHAR(255),
  IN p_password VARCHAR(255),
  IN p_type     VARCHAR(50),
  IN p_active   TINYINT
)
BEGIN
  INSERT INTO users (email, password, type, active)
  VALUES (p_email, p_password, p_type, p_active);
END //

DELIMITER ;

CALL addUser('richie@clickfit.com', 'richie_password', 'admin', 1);
