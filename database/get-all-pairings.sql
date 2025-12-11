-- Function to get all pairings with mentor, mentee, and coordinator details
CREATE OR REPLACE FUNCTION get_all_pairings_with_details()
RETURNS TABLE (
    id UUID,
    mentor_id UUID,
    mentee_id UUID,
    coordinator_id UUID,
    status TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    mentor JSONB,
    mentee JSONB,
    coordinator JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.mentor_id,
        p.mentee_id,
        p.coordinator_id,
        p.status,
        p.start_date,
        p.end_date,
        p.created_at,
        p.updated_at,
        row_to_json(mentor_user.*) || jsonb_build_object('mentor', row_to_json(mentor_profile.*)) as mentor,
        row_to_json(mentee_user.*) || jsonb_build_object('mentee', row_to_json(mentee_profile.*)) as mentee,
        row_to_json(coordinator_user.*) as coordinator
    FROM pairings p
    LEFT JOIN users mentor_user ON p.mentor_id = mentor_user.id
    LEFT JOIN mentors mentor_profile ON mentor_user.id = mentor_profile.user_id
    LEFT JOIN users mentee_user ON p.mentee_id = mentee_user.id
    LEFT JOIN mentees mentee_profile ON mentee_user.id = mentee_profile.user_id
    LEFT JOIN users coordinator_user ON p.coordinator_id = coordinator_user.id
    ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_pairings_with_details() TO authenticated;
