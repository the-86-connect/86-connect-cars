-- 86Connect Cars — Row Level Security Policies
-- Enable RLS on all tables and define access policies.

-- ── Vehicles ──
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read vehicles" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Admin manage vehicles" ON vehicles FOR ALL USING (auth.role() = 'service_role');

-- ── Testimonials ──
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Admin manage testimonials" ON testimonials FOR ALL USING (auth.role() = 'service_role');

-- ── FAQs ──
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Admin manage faqs" ON faqs FOR ALL USING (auth.role() = 'service_role');

-- ── Features ──
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read features" ON features FOR SELECT USING (true);
CREATE POLICY "Admin manage features" ON features FOR ALL USING (auth.role() = 'service_role');

-- ── Process Steps ──
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read process_steps" ON process_steps FOR SELECT USING (true);
CREATE POLICY "Admin manage process_steps" ON process_steps FOR ALL USING (auth.role() = 'service_role');

-- ── Gallery ──
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Admin manage gallery" ON gallery FOR ALL USING (auth.role() = 'service_role');

-- ── Brands ──
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Admin manage brands" ON brands FOR ALL USING (auth.role() = 'service_role');

-- ── Quotes ──
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
-- Anyone can submit a quote (INSERT from the public form)
CREATE POLICY "Public insert quotes" ON quotes FOR INSERT WITH CHECK (true);
-- Admin can read/manage all quotes
CREATE POLICY "Admin manage quotes" ON quotes FOR ALL USING (auth.role() = 'service_role');
-- Authenticated users can read their own quotes
CREATE POLICY "User read own quotes" ON quotes FOR SELECT USING (auth.uid() = user_id);

-- ── Users (profiles) ──
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- Users can read their own profile
CREATE POLICY "User read own profile" ON users FOR SELECT USING (auth.uid() = id);
-- Admin can read all profiles
CREATE POLICY "Admin manage users" ON users FOR ALL USING (auth.role() = 'service_role');

-- ── Favorites ──
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
-- Authenticated users can read, insert, delete their own favorites
CREATE POLICY "User manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Admin can read all favorites
CREATE POLICY "Admin read all favorites" ON favorites FOR SELECT USING (auth.role() = 'service_role');

-- ── Admins ──
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
-- No public access — only service_role can read/write
CREATE POLICY "Admin manage admins" ON admins FOR ALL USING (auth.role() = 'service_role');