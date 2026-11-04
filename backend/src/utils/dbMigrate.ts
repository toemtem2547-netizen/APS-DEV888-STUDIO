import { initDatabaseConnection, query } from '../config/db';

export async function runMigrations() {
  console.log('--- Starting Database Migrations ---');
  await initDatabaseConnection();

  const ddlStatements = [
    // Settings table
    `CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      key_name VARCHAR(100) UNIQUE NOT NULL,
      value TEXT NOT NULL,
      description VARCHAR(255),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Roles table
    `CREATE TABLE IF NOT EXISTS roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      description VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Permissions table
    `CREATE TABLE IF NOT EXISTS permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Role Permissions table
    `CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INT NOT NULL,
      permission_id INT NOT NULL,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Admins table
    `CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role_id INT NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      player_id VARCHAR(50) DEFAULT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Wallets table
    `CREATE TABLE IF NOT EXISTS wallets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNIQUE NOT NULL,
      balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Wallet Transactions table
    `CREATE TABLE IF NOT EXISTS wallet_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      wallet_id INT NOT NULL,
      user_id INT NOT NULL,
      type ENUM('TOPUP', 'PURCHASE', 'MYSTERY_BOX', 'BONUS', 'ADMIN_ADJUST') NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      balance_after DECIMAL(12, 2) NOT NULL,
      reference_type VARCHAR(50) DEFAULT NULL,
      reference_id VARCHAR(100) DEFAULT NULL,
      description VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Packages table
    `CREATE TABLE IF NOT EXISTS packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      coins INT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      bonus_coins INT DEFAULT 0,
      image_url VARCHAR(500),
      badge VARCHAR(50) DEFAULT NULL,
      is_popular BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Mystery Boxes table
    `CREATE TABLE IF NOT EXISTS mystery_boxes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      image_url VARCHAR(500),
      color_theme VARCHAR(50) DEFAULT 'bronze',
      badge VARCHAR(50) DEFAULT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Rewards table
    `CREATE TABLE IF NOT EXISTS rewards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      image_url VARCHAR(500),
      type ENUM('ITEM', 'CODE', 'CREDIT', 'COUPON', 'VIP') NOT NULL DEFAULT 'ITEM',
      value VARCHAR(255) NOT NULL,
      rarity ENUM('COMMON', 'RARE', 'EPIC', 'LEGENDARY') NOT NULL DEFAULT 'COMMON',
      stock INT DEFAULT -1,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Mystery Box Rewards (Mapping with weights) table
    `CREATE TABLE IF NOT EXISTS mystery_box_rewards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      box_id INT NOT NULL,
      reward_id INT NOT NULL,
      weight INT NOT NULL DEFAULT 10,
      is_active BOOLEAN DEFAULT TRUE,
      FOREIGN KEY (box_id) REFERENCES mystery_boxes(id) ON DELETE CASCADE,
      FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Draw Histories table
    `CREATE TABLE IF NOT EXISTS draw_histories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      box_id INT NOT NULL,
      box_name VARCHAR(100) NOT NULL,
      reward_id INT NOT NULL,
      reward_name VARCHAR(150) NOT NULL,
      reward_type VARCHAR(50) NOT NULL,
      reward_value VARCHAR(255) NOT NULL,
      rarity VARCHAR(50) NOT NULL,
      reward_image_url VARCHAR(500),
      cost DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Reward Inventories table
    `CREATE TABLE IF NOT EXISTS reward_inventories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      reward_id INT NOT NULL,
      reward_name VARCHAR(150) NOT NULL,
      reward_type VARCHAR(50) NOT NULL,
      reward_value VARCHAR(255) NOT NULL,
      rarity VARCHAR(50) NOT NULL,
      image_url VARCHAR(500),
      code_content VARCHAR(255) DEFAULT NULL,
      is_used BOOLEAN DEFAULT FALSE,
      used_at DATETIME DEFAULT NULL,
      acquired_from VARCHAR(100) DEFAULT 'MYSTERY_BOX',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Promotions table
    `CREATE TABLE IF NOT EXISTS promotions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      subtitle VARCHAR(255),
      banner_url VARCHAR(500),
      promo_type ENUM('DISCOUNT', 'BONUS', 'FLASH_SALE') NOT NULL DEFAULT 'DISCOUNT',
      discount_percent INT DEFAULT 0,
      bonus_percent INT DEFAULT 0,
      min_spend DECIMAL(10, 2) DEFAULT 0,
      code VARCHAR(50) DEFAULT NULL,
      max_uses INT DEFAULT 0,
      current_uses INT DEFAULT 0,
      start_date DATETIME NULL,
      end_date DATETIME NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Coupons table
    `CREATE TABLE IF NOT EXISTS coupons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      discount_amount DECIMAL(10, 2) DEFAULT 0,
      discount_percent INT DEFAULT 0,
      min_spend DECIMAL(10, 2) DEFAULT 0,
      max_uses INT DEFAULT 100,
      current_uses INT DEFAULT 0,
      expires_at DATETIME NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Orders table
    `CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(50) PRIMARY KEY,
      user_id INT NOT NULL,
      player_id VARCHAR(50) NOT NULL,
      package_id INT NOT NULL,
      package_name VARCHAR(100) NOT NULL,
      coins_amount INT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      discount_amount DECIMAL(10, 2) DEFAULT 0.00,
      final_price DECIMAL(10, 2) NOT NULL,
      payment_method ENUM('WALLET', 'PROMPTPAY', 'CREDIT_CARD') NOT NULL DEFAULT 'WALLET',
      status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED') NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Topup Transactions table
    `CREATE TABLE IF NOT EXISTS topup_transactions (
      id VARCHAR(50) PRIMARY KEY,
      user_id INT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      bonus_amount DECIMAL(10, 2) DEFAULT 0.00,
      total_credit DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(50) NOT NULL DEFAULT 'PROMPTPAY',
      status ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'COMPLETED',
      reference_code VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Gacha Items (for horizontal roulette reel)
    `CREATE TABLE IF NOT EXISTS gacha_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      reward_id INT NOT NULL,
      title VARCHAR(150) NOT NULL,
      subtitle VARCHAR(255),
      category VARCHAR(100) NOT NULL,
      value_text VARCHAR(100) NOT NULL,
      image_url VARCHAR(500),
      rarity ENUM('COMMON', 'RARE', 'EPIC', 'LEGENDARY') NOT NULL DEFAULT 'COMMON',
      weight INT NOT NULL DEFAULT 10,
      is_active BOOLEAN DEFAULT TRUE,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Gacha Spins history
    `CREATE TABLE IF NOT EXISTS gacha_spins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      gacha_item_id INT NOT NULL,
      reward_id INT NOT NULL,
      reward_name VARCHAR(150) NOT NULL,
      rarity VARCHAR(50) NOT NULL,
      cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      spin_type ENUM('FREE_DAILY', 'WALLET') NOT NULL DEFAULT 'FREE_DAILY',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (gacha_item_id) REFERENCES gacha_items(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  ];

  for (const statement of ddlStatements) {
    await query(statement);
  }

  console.log('--- Database Migrations Completed Successfully ---');
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
