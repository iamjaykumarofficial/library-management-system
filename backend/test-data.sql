-- Add test user if not exists
INSERT IGNORE INTO users (full_name, email, phone, password, role, membership_expiry) 
VALUES (
  'Test Member', 
  'member@test.com', 
  '1234567890', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
  'member', 
  DATE_ADD(CURDATE(), INTERVAL 1 YEAR)
);

-- Get the test user ID
SET @test_user_id = (SELECT id FROM users WHERE email = 'member@test.com');

-- Add some borrowed books for testing
INSERT IGNORE INTO borrowings (user_id, book_id, borrow_date, due_date, return_date, fine)
VALUES 
(@test_user_id, 'B001', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY), NULL, 0),
(@test_user_id, 'B002', DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), NULL, 100.00),
(@test_user_id, 'B003', DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 16 DAY), CURDATE(), 0);

-- Add payment history
INSERT IGNORE INTO payments (user_id, payment_id, amount, description, payment_date)
VALUES 
(@test_user_id, 'TEST001', 25.00, 'Membership fee', CURDATE());