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
        p.start_date::timestamptz,
        p.end_date::timestamptz,
        p.created_at,
        p.updated_at,
        jsonb_build_object(
            'id', mentor_user.id,
            'full_name', mentor_user.full_name,
            'email', mentor_user.email,
            'mentor', (SELECT row_to_json(m.*) FROM mentors m WHERE m.id = mentor_user.id)
        ) as mentor,
        jsonb_build_object(
            'id', mentee_user.id,
            'full_name', mentee_user.full_name,
            'email', mentee_user.email,
            'mentee', (SELECT row_to_json(me.*) FROM mentees me WHERE me.id = mentee_user.id)
        ) as mentee,
        jsonb_build_object(
            'id', coordinator_user.id,
            'full_name', coordinator_user.full_name,
            'email', coordinator_user.email
        ) as coordinator
    FROM pairings p
    LEFT JOIN users mentor_user ON p.mentor_id = mentor_user.id
    LEFT JOIN users mentee_user ON p.mentee_id = mentee_user.id
    LEFT JOIN users coordinator_user ON p.coordinator_id = coordinator_user.id
    ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_pairings_with_details() TO authenticated;
