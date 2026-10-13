-- Managers may view every project without gaining write access.
CREATE POLICY "projects_manager_read"
ON "projects"
FOR SELECT
TO authenticated
USING (
    auth.jwt() -> 'app_metadata' ->> 'workflow_role' = 'manager'
);

-- Managers may view every reminder without gaining write access.
CREATE POLICY "reminders_manager_read"
ON "reminders"
FOR SELECT
TO authenticated
USING (
    auth.jwt() -> 'app_metadata' ->> 'workflow_role' = 'manager'
);

-- Expose only the emails associated with project or reminder owners.
-- The function is executable by authenticated users, but only returns rows
-- when the server has established the manager claim for this transaction.
CREATE FUNCTION public.manager_owner_emails()
RETURNS TABLE (owner_id uuid, email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT users.id, users.email::text
    FROM auth.users AS users
    WHERE auth.jwt() -> 'app_metadata' ->> 'workflow_role' = 'manager'
      AND users.id IN (
          SELECT projects.owner_id FROM public.projects AS projects
          UNION
          SELECT reminders.owner_id FROM public.reminders AS reminders
      );
$$;

REVOKE ALL ON FUNCTION public.manager_owner_emails() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.manager_owner_emails() TO authenticated;
