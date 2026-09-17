-- ==========================================================
-- เที่ยวไทยตามฤดู (Thai Seasonal Travel)
-- Database Schema for Supabase / PostgreSQL with RLS
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TOURIST ATTRACTIONS TABLE
CREATE TABLE IF NOT EXISTS tourist_attractions (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    province VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    season VARCHAR(50) NOT NULL CHECK (season IN ('summer', 'rainy', 'winter', 'all')),
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    activities TEXT[] DEFAULT '{}',
    opening_hours TEXT DEFAULT 'ไม่มีข้อมูล',
    entrance_fee TEXT DEFAULT 'ไม่มีข้อมูล',
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    google_maps_url TEXT,
    main_image TEXT NOT NULL,
    what_to_bring TEXT[] DEFAULT '{}',
    tips TEXT,
    travel_directions TEXT,
    best_months VARCHAR(100),
    is_published BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ATTRACTION IMAGES TABLE (Gallery)
CREATE TABLE IF NOT EXISTS attraction_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attraction_id VARCHAR(100) REFERENCES tourist_attractions(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. FAVORITES TABLE (Saved places)
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    attraction_id VARCHAR(100) REFERENCES tourist_attractions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, attraction_id)
);

-- 6. REVIEWS & RATINGS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    attraction_id VARCHAR(100) REFERENCES tourist_attractions(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TRAVEL PLANS TABLE
CREATE TABLE IF NOT EXISTS travel_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    province VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TRAVEL PLAN ITEMS TABLE
CREATE TABLE IF NOT EXISTS travel_plan_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    travel_plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE,
    attraction_id VARCHAR(100) REFERENCES tourist_attractions(id) ON DELETE CASCADE,
    travel_date DATE,
    day_number INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourist_attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attraction_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plan_items ENABLE ROW LEVEL SECURITY;

-- Tourist Attractions: Public read
CREATE POLICY "Public attractions are viewable by everyone" ON tourist_attractions
    FOR SELECT USING (is_published = true);

-- Gallery Images: Public read
CREATE POLICY "Attraction images are viewable by everyone" ON attraction_images
    FOR SELECT USING (true);

-- Favorites: Users can manage their own favorites
CREATE POLICY "Users can manage their own favorites" ON favorites
    FOR ALL USING (auth.uid() = user_id);

-- Reviews: Public read, authenticated users can insert and update their own
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users and admins can delete reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Travel Plans: Users can view and manage their own plans
CREATE POLICY "Users can manage their own travel plans" ON travel_plans
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their travel plan items" ON travel_plan_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM travel_plans 
            WHERE travel_plans.id = travel_plan_items.travel_plan_id 
            AND travel_plans.user_id = auth.uid()
        )
    );
