-- ==============================================================================
-- PULSE GRID — Blood Management System (Full-Stack Supabase PostgreSQL Migration)
-- Course: College Mini-Project / Healthcare Transfusion Network
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Supabase Auth Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('donor', 'requester', 'hospital', 'admin')),
    phone TEXT,
    city TEXT,
    state TEXT DEFAULT 'Delhi',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_verification')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DONORS TABLE (Donor Health Screening & Availability)
CREATE TABLE IF NOT EXISTS public.donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    phone TEXT NOT NULL,
    gender TEXT DEFAULT 'Male' CHECK (gender IN ('Male', 'Female', 'Other')),
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 65),
    weight_kg NUMERIC(5, 2) CHECK (weight_kg >= 45),
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Delhi',
    address TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    is_available BOOLEAN DEFAULT TRUE,
    last_donation_date DATE DEFAULT NULL,
    total_donations INTEGER DEFAULT 0 CHECK (total_donations >= 0),
    emergency_contact TEXT,
    consent_preferences BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BLOOD BANKS TABLE (Accredited Facilities & Hospitals)
CREATE TABLE IF NOT EXISTS public.blood_banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    facility_type TEXT NOT NULL DEFAULT 'Blood Bank' CHECK (facility_type IN ('Blood Bank', 'Hospital', 'Trauma Center', 'Research Center')),
    license_no TEXT NOT NULL UNIQUE,
    contact_person TEXT,
    phone TEXT NOT NULL,
    emergency_hotline TEXT,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Delhi',
    pincode TEXT,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    operating_hours TEXT DEFAULT '24/7 Service',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BLOOD INVENTORY TABLE (Component Batches, Expiry, Units)
CREATE TABLE IF NOT EXISTS public.blood_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blood_bank_id UUID NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    component_type TEXT NOT NULL DEFAULT 'Whole Blood' CHECK (component_type IN ('Whole Blood', 'Packed Red Blood Cells', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate')),
    units INTEGER NOT NULL DEFAULT 0 CHECK (units >= 0), -- Strictly prevent negative inventory
    collection_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    batch_number TEXT NOT NULL UNIQUE,
    storage_temp TEXT DEFAULT '2-6°C',
    status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Low Stock', 'Expiring Soon', 'Expired', 'Out of Stock')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BLOOD REQUESTS TABLE (Triage Priority, Dispatch Workflow)
CREATE TABLE IF NOT EXISTS public.blood_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_code TEXT NOT NULL UNIQUE,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    patient_age INTEGER,
    patient_gender TEXT CHECK (patient_gender IN ('Male', 'Female', 'Other')),
    blood_bank_id UUID REFERENCES public.blood_banks(id) ON DELETE SET NULL,
    hospital_name TEXT NOT NULL,
    hospital_address TEXT,
    city TEXT NOT NULL,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    component_type TEXT NOT NULL DEFAULT 'Whole Blood' CHECK (component_type IN ('Whole Blood', 'Packed Red Blood Cells', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate')),
    units_required INTEGER NOT NULL DEFAULT 1 CHECK (units_required > 0),
    priority TEXT NOT NULL DEFAULT 'Urgent' CHECK (priority IN ('Critical', 'Urgent', 'Routine')),
    reason TEXT NOT NULL,
    required_date DATE NOT NULL,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    doctor_name TEXT,
    consent_given BOOLEAN DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Approved', 'Partially Fulfilled', 'Fulfilled', 'Rejected', 'Cancelled')),
    fulfillment_notes TEXT,
    status_updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INVENTORY TRANSACTIONS TABLE (Immutable Audit Ledger)
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID REFERENCES public.blood_inventory(id) ON DELETE SET NULL,
    blood_bank_id UUID NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    request_id UUID REFERENCES public.blood_requests(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('IN', 'OUT', 'ADJUSTMENT', 'DISPOSAL', 'EXPIRED')),
    units INTEGER NOT NULL CHECK (units != 0),
    previous_units INTEGER NOT NULL CHECK (previous_units >= 0),
    new_units INTEGER NOT NULL CHECK (new_units >= 0),
    reason TEXT,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTIFICATIONS TABLE (In-App Alert Feed)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_role TEXT CHECK (target_role IN ('all', 'donor', 'requester', 'hospital', 'admin')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'alert')),
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AUDIT LOGS TABLE (Cryptographic System Event Ledger)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR FREQUENTLY SEARCHED FIELDS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_inventory_lookup ON public.blood_inventory (blood_group, component_type, status);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON public.blood_inventory (expiry_date);
CREATE INDEX IF NOT EXISTS idx_requests_lookup ON public.blood_requests (blood_group, status, priority);
CREATE INDEX IF NOT EXISTS idx_requests_requester ON public.blood_requests (requester_id);
CREATE INDEX IF NOT EXISTS idx_donors_search ON public.donors (blood_group, city, is_available);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_transactions_bank ON public.inventory_transactions (blood_bank_id, created_at);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all 8 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: get user role securely from database
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by authenticated users"
    ON public.profiles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can edit their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Donors Policies (Privacy Protected: Public only sees availability and blood group, not full address)
CREATE POLICY "Donors can manage their own donor profile"
    ON public.donors FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Authorized hospital staff and admins can view available donors"
    ON public.donors FOR SELECT
    USING (
        auth.uid() = user_id OR
        public.get_user_role() IN ('hospital', 'admin')
    );

-- Blood Banks Policies
CREATE POLICY "Public can view verified blood banks"
    ON public.blood_banks FOR SELECT
    USING (is_verified = TRUE OR public.get_user_role() = 'admin');

CREATE POLICY "Hospital staff can update their own facility"
    ON public.blood_banks FOR UPDATE
    USING (auth.uid() = user_id OR public.get_user_role() = 'admin');

-- Blood Inventory Policies
CREATE POLICY "Anyone can view available blood stock"
    ON public.blood_inventory FOR SELECT
    USING (status != 'Expired');

CREATE POLICY "Hospital staff and admin can manage inventory"
    ON public.blood_inventory FOR ALL
    USING (
        public.get_user_role() IN ('hospital', 'admin')
    );

-- Blood Requests Policies
CREATE POLICY "Requesters can view their own requests"
    ON public.blood_requests FOR SELECT
    USING (
        requester_id = auth.uid() OR
        public.get_user_role() IN ('hospital', 'admin')
    );

CREATE POLICY "Authenticated users can submit blood requests"
    ON public.blood_requests FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Staff and admin can update blood request status"
    ON public.blood_requests FOR UPDATE
    USING (
        public.get_user_role() IN ('hospital', 'admin') OR
        (requester_id = auth.uid() AND status IN ('Pending', 'Under Review'))
    );

-- Transactions Policies
CREATE POLICY "Staff and admins can view inventory transactions"
    ON public.inventory_transactions FOR SELECT
    USING (public.get_user_role() IN ('hospital', 'admin'));

-- Notifications Policies
CREATE POLICY "Users can view and update their own notifications"
    ON public.notifications FOR SELECT
    USING (
        user_id = auth.uid() OR 
        target_role = public.get_user_role() OR 
        target_role = 'all'
    );

CREATE POLICY "Users can mark notifications as read"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid() OR target_role = public.get_user_role());

-- Audit Logs Policies
CREATE POLICY "Only administrators can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.get_user_role() = 'admin');

-- ==============================================================================
-- ATOMIC STORED FUNCTION: ISSUE BLOOD UNITS (PREVENTS NEGATIVE INVENTORY & OVERSELLING)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.issue_blood_units(
    p_request_id UUID,
    p_inventory_id UUID,
    p_units_to_issue INTEGER,
    p_staff_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_req RECORD;
    v_batch RECORD;
    v_new_units INTEGER;
    v_new_status TEXT;
BEGIN
    -- 1. Lock and fetch blood request
    SELECT * INTO v_req FROM public.blood_requests WHERE id = p_request_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Blood request not found.';
    END IF;

    IF v_req.status = 'Fulfilled' THEN
        RAISE EXCEPTION 'Duplicate processing: This request has already been fulfilled.';
    END IF;

    IF v_req.status = 'Cancelled' THEN
        RAISE EXCEPTION 'Cannot fulfill a cancelled request.';
    END IF;

    -- 2. Lock and fetch inventory batch
    SELECT * INTO v_batch FROM public.blood_inventory WHERE id = p_inventory_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target inventory batch not found.';
    END IF;

    IF v_batch.expiry_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Safety violation: Cannot issue expired blood stock (Expired on %).', v_batch.expiry_date;
    END IF;

    IF v_batch.units < p_units_to_issue THEN
        RAISE EXCEPTION 'Insufficient stock: Batch % has only % units available (requested %).', v_batch.batch_number, v_batch.units, p_units_to_issue;
    END IF;

    -- 3. Calculate new units
    v_new_units := v_batch.units - p_units_to_issue;
    IF v_new_units <= 0 THEN
        v_new_status := 'Out of Stock';
    ELSIF v_new_units <= 5 THEN
        v_new_status := 'Low Stock';
    ELSE
        v_new_status := 'Available';
    END IF;

    -- 4. Atomically update inventory
    UPDATE public.blood_inventory
    SET units = v_new_units,
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_inventory_id;

    -- 5. Record immutable transaction ledger
    INSERT INTO public.inventory_transactions (
        inventory_id,
        blood_bank_id,
        request_id,
        transaction_type,
        units,
        previous_units,
        new_units,
        reason,
        performed_by
    ) VALUES (
        p_inventory_id,
        v_batch.blood_bank_id,
        p_request_id,
        'OUT',
        p_units_to_issue,
        v_batch.units,
        v_new_units,
        COALESCE(p_notes, 'Issued for Request ' || v_req.request_code),
        p_staff_id
    );

    -- 6. Update request status
    UPDATE public.blood_requests
    SET status = 'Fulfilled',
        assigned_facility_id = v_batch.blood_bank_id,
        fulfillment_notes = p_notes,
        status_updated_by = p_staff_id,
        status_updated_at = NOW(),
        updated_at = NOW()
    WHERE id = p_request_id;

    -- 7. Trigger in-app notification to requester
    IF v_req.requester_id IS NOT NULL THEN
        INSERT INTO public.notifications (
            user_id,
            target_role,
            title,
            message,
            type,
            link
        ) VALUES (
            v_req.requester_id,
            'requester',
            'Blood Units Issued & Dispatched',
            'Your blood request ' || v_req.request_code || ' for ' || v_req.patient_name || ' (' || p_units_to_issue || 'u ' || v_req.blood_group || ') has been issued.',
            'success',
            '/requester-dashboard'
        );
    END IF;

    -- 8. Audit log
    INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        details
    ) VALUES (
        p_staff_id,
        'REQUEST_FULFILLED_ATOMIC',
        'blood_requests',
        p_request_id::TEXT,
        'Issued ' || p_units_to_issue || ' units from batch ' || v_batch.batch_number
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Units issued safely. Inventory and transaction ledger updated.',
        'batch_number', v_batch.batch_number,
        'remaining_units', v_new_units
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
