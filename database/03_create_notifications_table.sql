-- =============================================================================
-- EcoSwitch Database - Notifications System
-- =============================================================================
-- Description: Script to create the notifications table and related indexes
-- Author: EcoSwitch Development Team
-- Date: 2025-08-15
-- =============================================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_notifications_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
    ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_type 
    ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read 
    ON notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
    ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for 
    ON notifications(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
    ON notifications(user_id, is_read) 
    WHERE is_read = FALSE;

-- Create composite index for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
    ON notifications(user_id, created_at DESC);

-- Add comments to the table and columns
COMMENT ON TABLE notifications IS 'Stores user notifications for the EcoSwitch application';
COMMENT ON COLUMN notifications.id IS 'Unique identifier for the notification';
COMMENT ON COLUMN notifications.user_id IS 'Reference to the user who receives the notification';
COMMENT ON COLUMN notifications.type IS 'Type of notification (achievement, reminder, tip, challenge, etc.)';
COMMENT ON COLUMN notifications.title IS 'Brief title of the notification';
COMMENT ON COLUMN notifications.message IS 'Detailed message content of the notification';
COMMENT ON COLUMN notifications.data IS 'Additional JSON data for the notification (links, actions, etc.)';
COMMENT ON COLUMN notifications.is_read IS 'Whether the notification has been read by the user';
COMMENT ON COLUMN notifications.scheduled_for IS 'When the notification should be sent (for scheduled notifications)';
COMMENT ON COLUMN notifications.sent_at IS 'When the notification was actually sent';
COMMENT ON COLUMN notifications.created_at IS 'When the notification was created';

-- =============================================================================
-- Notification Types and Sample Data
-- =============================================================================

-- Create a function to add sample notification types (for documentation)
CREATE OR REPLACE FUNCTION get_notification_types() 
RETURNS TABLE(type_name VARCHAR, description TEXT) 
LANGUAGE SQL
AS $$
    SELECT 'achievement', 'User earned a new achievement or milestone'
    UNION ALL
    SELECT 'reminder', 'Reminder to log energy consumption or complete tasks'
    UNION ALL
    SELECT 'tip', 'Energy saving tips and recommendations'
    UNION ALL
    SELECT 'challenge', 'New challenges available or challenge updates'
    UNION ALL
    SELECT 'goal', 'Goal progress updates and achievements'
    UNION ALL
    SELECT 'system', 'System announcements and updates'
    UNION ALL
    SELECT 'social', 'Community posts, comments, and social interactions'
    UNION ALL
    SELECT 'bill_reminder', 'Reminder to input monthly energy bills'
    UNION ALL
    SELECT 'savings_report', 'Monthly or weekly energy savings reports'
    UNION ALL
    SELECT 'welcome', 'Welcome messages for new users or feature introductions';
$$;

-- =============================================================================
-- Helper Functions
-- =============================================================================

-- Function to create a new notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR,
    p_title VARCHAR,
    p_message TEXT,
    p_data JSONB DEFAULT '{}',
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data,
        scheduled_for,
        sent_at
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_data,
        p_scheduled_for,
        CASE WHEN p_scheduled_for IS NULL THEN NOW() ELSE NULL END
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
    p_notification_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications 
    SET is_read = TRUE 
    WHERE id = p_notification_id 
      AND user_id = p_user_id 
      AND is_read = FALSE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count > 0;
END;
$$;

-- Function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
AS $$
    SELECT COUNT(*)::INTEGER
    FROM notifications
    WHERE user_id = p_user_id
      AND is_read = FALSE;
$$;

-- Function to clean up old notifications (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep
      AND is_read = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- =============================================================================
-- Sample Data (Optional - for testing)
-- =============================================================================

-- Insert sample notifications for testing (uncomment if needed)
/*
-- Note: Replace 'your-test-user-id' with an actual user ID from your users table
INSERT INTO notifications (user_id, type, title, message, data) VALUES 
(
    'your-test-user-id',
    'welcome',
    'Welcome to EcoSwitch! 🌱',
    'Thank you for joining EcoSwitch! Start by setting up your home profile to get personalized energy recommendations.',
    '{"action": "setup_home", "screen": "HomeData"}'
),
(
    'your-test-user-id',
    'tip',
    'Energy Saving Tip 💡',
    'Did you know? Switching to LED bulbs can reduce your lighting energy consumption by up to 75%!',
    '{"tip_category": "lighting", "savings_potential": "75%"}'
),
(
    'your-test-user-id',
    'reminder',
    'Time to Log Your Energy Usage 📊',
    'Don''t forget to log this month''s energy consumption to track your progress!',
    '{"action": "log_consumption", "screen": "Consumption"}'
);
*/

-- =============================================================================
-- Grants and Permissions
-- =============================================================================

-- Grant permissions to the application user (adjust role name as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO ecoswitch_app_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO ecoswitch_app_user;

COMMENT ON FUNCTION create_notification IS 'Creates a new notification for a user';
COMMENT ON FUNCTION mark_notification_read IS 'Marks a notification as read for a specific user';
COMMENT ON FUNCTION get_unread_notification_count IS 'Returns the count of unread notifications for a user';
COMMENT ON FUNCTION cleanup_old_notifications IS 'Cleans up old read notifications to maintain database performance';

-- =============================================================================
-- Automatic Notification Triggers
-- =============================================================================

-- Function to automatically create welcome notification when user is created
CREATE OR REPLACE FUNCTION trigger_welcome_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Create welcome notification for new user
    INSERT INTO notifications (user_id, type, title, message, data, sent_at) 
    VALUES (
        NEW.id,
        'welcome',
        'Welcome to EcoSwitch! 🌱',
        'Thank you for joining EcoSwitch. Start by setting up your home profile to get personalized energy saving recommendations.',
        '{"action": "setup_home", "screen": "HomeData", "is_first_login": true}',
        NOW()
    );
    
    RETURN NEW;
END;
$$;

-- Function to create notification when household is set up
CREATE OR REPLACE FUNCTION trigger_household_setup_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Create notification when household profile is completed
    INSERT INTO notifications (user_id, type, title, message, data, sent_at) 
    VALUES (
        NEW.user_id,
        'achievement',
        'Home Profile Completed! 🏠',
        'Great job setting up your home profile. Now you can start tracking your energy consumption.',
        '{"action": "log_consumption", "screen": "BaseConsumption", "achievement": "household_setup"}',
        NOW()
    );
    
    RETURN NEW;
END;
$$;

-- Function to create notification when energy consumption is logged
CREATE OR REPLACE FUNCTION trigger_consumption_logged_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    consumption_count INTEGER;
    user_first_name VARCHAR;
BEGIN
    -- Count how many times this user has logged consumption
    SELECT COUNT(*) INTO consumption_count
    FROM energy_consumption 
    WHERE user_id = NEW.user_id;
    
    -- Get user's first name for personalization
    SELECT first_name INTO user_first_name
    FROM users 
    WHERE id = NEW.user_id;
    
    -- First consumption entry
    IF consumption_count = 1 THEN
        INSERT INTO notifications (user_id, type, title, message, data, sent_at) 
        VALUES (
            NEW.user_id,
            'achievement',
            'First Consumption Logged! 📊',
            COALESCE(user_first_name, 'User') || ', you have logged your first energy consumption. Keep it up to monitor your progress!',
            '{"achievement": "first_consumption", "points": 50, "action": "view_dashboard"}',
            NOW()
        );
    
    -- Weekly milestone (every 7 entries)
    ELSIF consumption_count % 7 = 0 THEN
        INSERT INTO notifications (user_id, type, title, message, data, sent_at) 
        VALUES (
            NEW.user_id,
            'achievement',
            'Weekly Tracking Complete! 🎯',
            'Amazing! You have logged ' || consumption_count || ' consumption entries. Your consistency is helping you save energy.',
            '{"achievement": "weekly_tracking", "points": 100, "entries_count": ' || consumption_count || '}',
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Function to create savings achievement notifications
CREATE OR REPLACE FUNCTION trigger_savings_achievement_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    savings_percentage DECIMAL;
    user_first_name VARCHAR;
BEGIN
    -- Only trigger on updates where energy_savings_percentage changed significantly
    IF NEW.energy_savings_percentage IS NOT NULL AND 
       (OLD.energy_savings_percentage IS NULL OR 
        ABS(NEW.energy_savings_percentage - COALESCE(OLD.energy_savings_percentage, 0)) >= 5) THEN
        
        savings_percentage := NEW.energy_savings_percentage;
        
        -- Get user's first name
        SELECT first_name INTO user_first_name
        FROM users 
        WHERE id = NEW.user_id;
        
        -- Savings milestone notifications
        IF savings_percentage >= 10 AND savings_percentage < 15 THEN
            INSERT INTO notifications (user_id, type, title, message, data, sent_at) 
            VALUES (
                NEW.user_id,
                'achievement',
                '10% Savings Achieved! 🎉',
                'Congratulations ' || COALESCE(user_first_name, 'User') || '! You have achieved ' || ROUND(savings_percentage, 1) || '% energy savings.',
                '{"achievement": "savings_10", "points": 200, "savings_percentage": ' || savings_percentage || '}',
                NOW()
            );
            
        ELSIF savings_percentage >= 20 AND savings_percentage < 25 THEN
            INSERT INTO notifications (user_id, type, title, message, data, sent_at) 
            VALUES (
                NEW.user_id,
                'achievement',
                '20% Savings - You''re Amazing! 🌟',
                'Wow! ' || COALESCE(user_first_name, 'User') || ', you have reached ' || ROUND(savings_percentage, 1) || '% energy savings. Keep it up!',
                '{"achievement": "savings_20", "points": 500, "savings_percentage": ' || savings_percentage || '}',
                NOW()
            );
            
        ELSIF savings_percentage >= 30 THEN
            INSERT INTO notifications (user_id, type, title, message, data, sent_at) 
            VALUES (
                NEW.user_id,
                'achievement',
                '30%+ Savings - You''re an Energy Hero! 🦸‍♀️',
                'Extraordinary! ' || COALESCE(user_first_name, 'User') || ', you have achieved ' || ROUND(savings_percentage, 1) || '% energy savings. You''re an example for everyone!',
                '{"achievement": "savings_30", "points": 1000, "savings_percentage": ' || savings_percentage || ', "badge": "energy_hero"}',
                NOW()
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Function to send periodic reminder notifications
CREATE OR REPLACE FUNCTION create_consumption_reminders()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    user_record RECORD;
    days_since_last_entry INTEGER;
    reminder_count INTEGER := 0;
BEGIN
    -- Find users who haven't logged consumption in the last 7 days
    FOR user_record IN
        SELECT DISTINCT u.id, u.first_name, u.email
        FROM users u
        LEFT JOIN energy_consumption ec ON u.id = ec.user_id
        WHERE u.is_active = true
        AND (
            ec.logged_at IS NULL OR 
            ec.logged_at < NOW() - INTERVAL '7 days'
        )
        -- Avoid sending multiple reminders
        AND NOT EXISTS (
            SELECT 1 FROM notifications n 
            WHERE n.user_id = u.id 
            AND n.type = 'reminder' 
            AND n.created_at > NOW() - INTERVAL '7 days'
        )
    LOOP
        -- Calculate days since last entry
        SELECT COALESCE(EXTRACT(DAY FROM NOW() - MAX(logged_at)), 30) 
        INTO days_since_last_entry
        FROM energy_consumption 
        WHERE user_id = user_record.id;
        
        -- Create reminder notification
        INSERT INTO notifications (user_id, type, title, message, data, sent_at) 
        VALUES (
            user_record.id,
            'reminder',
            '⏰ Time to Log Your Energy Consumption',
            'Hello ' || COALESCE(user_record.first_name, 'User') || '! It has been ' || days_since_last_entry || ' days since your last entry. Keep tracking your progress.',
            '{"action": "log_consumption", "screen": "Consumption", "days_since_last": ' || days_since_last_entry || '}',
            NOW()
        );
        
        reminder_count := reminder_count + 1;
    END LOOP;
    
    RETURN reminder_count;
END;
$$;

-- Function to send weekly energy tips
CREATE OR REPLACE FUNCTION create_weekly_energy_tips()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    user_record RECORD;
    tips TEXT[] := ARRAY[
        'Unplug electronic devices when not in use. They can consume up to 10% of energy in standby mode.',
        'Use LED bulbs: they consume up to 75% less energy than incandescent bulbs and last 25 times longer.',
        'Adjust your thermostat by 1-2 degrees: it can reduce your heating bill by up to 10%.',
        'Wash your clothes with cold water when possible: up to 90% of energy is used to heat the water.',
        'Seal air leaks in windows and doors to improve your home''s energy efficiency.',
        'Use power strips with switches to turn off multiple devices at once.',
        'Take advantage of natural light during the day to reduce artificial lighting usage.'
    ];
    random_tip TEXT;
    tip_count INTEGER := 0;
BEGIN
    -- Select a random tip
    random_tip := tips[1 + floor(random() * array_length(tips, 1))::integer];
    
    -- Send tip to active users who haven't received a tip in the last week
    FOR user_record IN
        SELECT id, first_name
        FROM users 
        WHERE is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM notifications n 
            WHERE n.user_id = users.id 
            AND n.type = 'tip' 
            AND n.created_at > NOW() - INTERVAL '7 days'
        )
    LOOP
        INSERT INTO notifications (user_id, type, title, message, data, sent_at) 
        VALUES (
            user_record.id,
            'tip',
            '💡 Weekly Energy Saving Tip',
            random_tip,
            '{"tip_category": "weekly", "source": "automated"}',
            NOW()
        );
        
        tip_count := tip_count + 1;
    END LOOP;
    
    RETURN tip_count;
END;
$$;

-- =============================================================================
-- Create Triggers
-- =============================================================================

-- Trigger for welcome notification on user creation
CREATE OR REPLACE TRIGGER trigger_user_welcome_notification
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_welcome_notification();

-- Trigger for household setup completion
CREATE OR REPLACE TRIGGER trigger_household_completion_notification
    AFTER INSERT ON households
    FOR EACH ROW
    EXECUTE FUNCTION trigger_household_setup_notification();

-- Trigger for consumption logging achievements
CREATE OR REPLACE TRIGGER trigger_consumption_achievement_notification
    AFTER INSERT ON energy_consumption
    FOR EACH ROW
    EXECUTE FUNCTION trigger_consumption_logged_notification();

-- Trigger for savings achievements
CREATE OR REPLACE TRIGGER trigger_savings_milestone_notification
    AFTER UPDATE ON user_analytics
    FOR EACH ROW
    EXECUTE FUNCTION trigger_savings_achievement_notification();

-- =============================================================================
-- Scheduled Jobs Setup (Comments for manual setup)
-- =============================================================================

/*
-- To set up automatic periodic notifications, you can use pg_cron extension:
-- 
-- 1. Install pg_cron extension:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- 
-- 2. Schedule weekly reminders (every Monday at 9 AM):
-- SELECT cron.schedule('weekly-consumption-reminders', '0 9 * * 1', 'SELECT create_consumption_reminders();');
-- 
-- 3. Schedule weekly tips (every Wednesday at 10 AM):
-- SELECT cron.schedule('weekly-energy-tips', '0 10 * * 3', 'SELECT create_weekly_energy_tips();');
-- 
-- 4. Schedule monthly cleanup (first day of month at 2 AM):
-- SELECT cron.schedule('monthly-notification-cleanup', '0 2 1 * *', 'SELECT cleanup_old_notifications(90);');
-- 
-- Alternative: Use your backend application to schedule these functions
*/

COMMENT ON FUNCTION trigger_welcome_notification IS 'Automatically creates welcome notification when a new user registers';
COMMENT ON FUNCTION trigger_household_setup_notification IS 'Creates achievement notification when user completes household setup';
COMMENT ON FUNCTION trigger_consumption_logged_notification IS 'Creates achievement notifications for consumption logging milestones';
COMMENT ON FUNCTION trigger_savings_achievement_notification IS 'Creates notifications for energy savings achievements';
COMMENT ON FUNCTION create_consumption_reminders IS 'Creates reminder notifications for users who haven''t logged consumption recently';
COMMENT ON FUNCTION create_weekly_energy_tips IS 'Sends weekly energy saving tips to active users';

-- =============================================================================
-- End of Script
-- =============================================================================
