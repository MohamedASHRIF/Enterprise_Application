INSERT INTO notification (user_email, title, message, type, status, created_at)
VALUES
('john@example.com', 'Welcome!', 'Welcome to our platform.', 'SYSTEM', 'UNREAD', CURRENT_TIMESTAMP),
('john@example.com', 'Update', 'Your profile was updated successfully.', 'SYSTEM', 'READ', CURRENT_TIMESTAMP),
('jane@example.com', 'New Message', 'You received a new message from Support.', 'EMAIL', 'UNREAD', CURRENT_TIMESTAMP);
