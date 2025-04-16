-- মানুষ ওয়েবসাইট ডাটাবেস স্কিমা

-- ইউজার টেবিল
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    user_type ENUM('client', 'service_provider', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- সার্ভিস প্রোভাইডার প্রোফাইল টেবিল
CREATE TABLE service_provider_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    nid_number VARCHAR(20) NOT NULL,
    profile_picture VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    area VARCHAR(100) NOT NULL,
    bio TEXT,
    experience INT,
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ক্লায়েন্ট প্রোফাইল টেবিল
CREATE TABLE client_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    address TEXT,
    area VARCHAR(100),
    profile_picture VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- সার্ভিস ক্যাটাগরি টেবিল
CREATE TABLE service_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_bn VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description_bn TEXT,
    description_en TEXT,
    icon VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- সার্ভিস টেবিল
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    category_id INT NOT NULL,
    title_bn VARCHAR(200) NOT NULL,
    title_en VARCHAR(200) NOT NULL,
    description_bn TEXT NOT NULL,
    description_en TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    availability BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES service_provider_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES service_categories(id)
);

-- সার্ভিস বুকিং টেবিল
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    client_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (client_id) REFERENCES client_profiles(id)
);

-- পেমেন্ট টেবিল
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    payment_method ENUM('bkash', 'nagad', 'cash') NOT NULL,
    transaction_id VARCHAR(100),
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- রিভিউ টেবিল
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    client_id INT NOT NULL,
    provider_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (client_id) REFERENCES client_profiles(id),
    FOREIGN KEY (provider_id) REFERENCES service_provider_profiles(id)
);

-- মেসেজ টেবিল
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    booking_id INT,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- এরিয়া টেবিল (ঢাকার নির্দিষ্ট এলাকাগুলি)
CREATE TABLE areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_bn VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    thana VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- পয়েন্ট সিস্টেম টেবিল
CREATE TABLE points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    points_balance INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- পয়েন্ট ট্রানজেকশন টেবিল
CREATE TABLE point_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    points_amount INT NOT NULL,
    transaction_type ENUM('earned', 'spent', 'refunded') NOT NULL,
    description TEXT,
    reference_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ইনিশিয়াল ডাটা ইনসার্ট - এরিয়া
INSERT INTO areas (name_bn, name_en, thana) VALUES 
('সুত্রাপুর', 'Sutrapur', 'সুত্রাপুর'),
('গেন্ডারিয়া', 'Gendaria', 'গেন্ডারিয়া'),
('যাত্রাবাড়ি', 'Jatrabari', 'যাত্রাবাড়ি');

-- ইনিশিয়াল ডাটা ইনসার্ট - সার্ভিস ক্যাটাগরি
INSERT INTO service_categories (name_bn, name_en, description_bn, description_en) VALUES 
('ইলেকট্রিশিয়ান', 'Electrician', 'বাসা-বাড়ি, অফিস কিংবা যেকোনো স্থাপনায় বিদ্যুতের কাজ', 'Electrical work in homes, offices or any establishment'),
('প্লাম্বার', 'Plumber', 'পানির লাইন স্থাপন ও মেরামত, লিকেজ ঠিক করা', 'Water line installation and repair, fixing leakage'),
('ফার্নিচার মিস্ত্রি', 'Furniture Mechanic/Carpenter', 'কাঠ বা অন্যান্য উপাদানে তৈরি আসবাবপত্র তৈরি, মেরামত ও সংযোজন করা', 'Making, repairing and assembling furniture made of wood or other materials'),
('রংমিস্ত্রি', 'Painter', 'বাসা-বাড়ি, অফিস কিংবা অন্যান্য স্থাপনায় রং করা', 'Painting houses, offices or other establishments'),
('পরিচ্ছন্নতাকর্মী/সুইপার', 'Cleaner/Sweeper', 'বাসা-বাড়ি, রাস্তাঘাট, অফিস কিংবা অন্যান্য স্থান পরিষ্কার পরিচ্ছন্ন রাখা', 'Keeping houses, streets, offices or other places clean'),
('গ্যাস মিস্ত্রি', 'Gas Mechanic', 'গ্যাসের লাইন স্থাপন, মেরামত এবং গ্যাস সিলিন্ডার ও চুলা সংযোগ ও মেরামত করা', 'Gas line installation, repair and gas cylinder and stove connection and repair'),
('নির্মাণ শ্রমিক', 'Construction Laborer', 'ভবন নির্মাণ বা অন্যান্য নির্মাণ কাজে শারীরিক শ্রম দেওয়া', 'Physical labor in building construction or other construction work'),
('পরিবহন কর্মী', 'Transportation Worker', 'বাসা-বাড়ি বা অফিসের জিনিসপত্র স্থানান্তর করার জন্য গাড়ি চালানো এবং লোডিং-আনলোডিং এ সাহায্য করা', 'Driving vehicles and helping with loading-unloading for moving household or office items'),
('ওয়েল্ডিং মিস্ত্রি', 'Welding Mechanic', 'ধাতব বস্তু জোড়া লাগানো বা মেরামতের কাজ করা', 'Joining or repairing metal objects'),
('ডাক্তার', 'Doctor', 'অসুস্থ মানুষের চিকিৎসা সেবা প্রদান করা', 'Providing medical services to sick people'),
('নার্স', 'Nurse', 'অসুস্থ মানুষের সেবা ও পরিচর্যা করা', 'Providing care and nursing to sick people'),
('ফার্মাসিস্ট/ওষুধ বিক্রেতা', 'Pharmacist/Medicine Seller', 'প্রেসক্রিপশন অনুযায়ী ওষুধ সরবরাহ করা', 'Supplying medicines according to prescription'),
('মুদি দোকানি', 'Grocery Shopkeeper', 'দৈনন্দিন প্রয়োজনীয় খাদ্যসামগ্রী ও অন্যান্য জিনিস বিক্রি করা', 'Selling daily necessities and other items'),
('কাঁচাবাজারের বিক্রেতা', 'Raw Market Vendor', 'শাকসবজি, মাছ, মাংস ও অন্যান্য কাঁচাপণ্য বিক্রি করা', 'Selling vegetables, fish, meat and other raw products'),
('বাবুর্চি/রান্নার লোক', 'Cook', 'বাসা-বাড়ি, অফিস বা অনুষ্ঠানে খাবার তৈরি করা', 'Preparing food at home, office or events'),
('গৃহকর্মী', 'Domestic Helper', 'বাসা-বাড়ির বিভিন্ন কাজ যেমন - পরিষ্কার করা, কাপড় ধোয়া, রান্না করা ইত্যাদি কাজে সাহায্য করা', 'Helping with various household chores such as cleaning, washing clothes, cooking, etc.'),
('নিরাপত্তাকর্মী', 'Security Guard', 'বিভিন্ন স্থানে নিরাপত্তা প্রদান করা', 'Providing security at various places'),
('অনলাইন ডেলিভারি কর্মী', 'Online Delivery Worker', 'বিভিন্ন পণ্য বা খাবার অনলাইনে অর্ডার অনুযায়ী গ্রাহকের কাছে পৌঁছে দেওয়া', 'Delivering various products or food to customers according to online orders'),
('মোবাইল সার্ভিসিং টেকনিশিয়ান', 'Mobile Servicing Technician', 'মোবাইল ফোনের বিভিন্ন সমস্যা সমাধান ও মেরামত করা', 'Solving various problems and repairing mobile phones'),
('সাধারণ শ্রমিক/কুলি', 'General Laborer/Coolie', 'বিভিন্ন ধরনের শারীরিক শ্রমের কাজ করা', 'Doing various types of physical labor'),
('দর্জি', 'Tailor', 'পোশাক তৈরি ও মাপ অনুযায়ী সংশোধন করা', 'Making clothes and adjusting according to measurements'),
('জুতা মেরামতকারী', 'Shoe Repairer', 'ছেঁড়া বা নষ্ট জুতা মেরামত করা', 'Repairing torn or damaged shoes'),
('নাপিত/ক্ষৌরকার', 'Barber', 'চুল কাটা ও দাড়ি কামানো', 'Cutting hair and shaving beard'),
('বিউটিশিয়ান', 'Beautician', 'ত্বক ও চুলের যত্ন এবং সাজসজ্জার কাজ করা', 'Skin and hair care and makeup work'),
('লন্ড্রি/ধোপা', 'Laundry Worker', 'কাপড় ধোয়া ও ইস্ত্রি করা', 'Washing and ironing clothes'),
('ইন্টারনেট সার্ভিস প্রোভাইডার', 'Internet Service Provider', 'ইন্টারনেট সংযোগ স্থাপন ও সমস্যা সমাধান করা', 'Internet connection installation and problem solving'),
('কম্পিউটার সার্ভিসিং টেকনিশিয়ান', 'Computer Servicing Technician', 'কম্পিউটার ও ল্যাপটপের বিভিন্ন সমস্যা সমাধান ও মেরামত করা', 'Solving various problems and repairing computers and laptops'),
('এয়ার কন্ডিশনার (এসি) মেকানিক', 'AC Mechanic', 'এসি স্থাপন, মেরামত ও সার্ভিসিং করা', 'AC installation, repair and servicing'),
('রেফ্রিজারেটর মেকানিক', 'Refrigerator Mechanic', 'ফ্রিজ মেরামত ও সার্ভিসিং করা', 'Refrigerator repair and servicing'),
('ওয়াশিং মেশিন মেকানিক', 'Washing Machine Mechanic', 'ওয়াশিং মেশিন মেরামত ও সার্ভিসিং করা', 'Washing machine repair and servicing'),
('মাইক্রোবাস/পিকআপ ভ্যান চালক', 'Microbus/Pickup Van Driver', 'যাত্রী বা পণ্য পরিবহনের জন্য গাড়ি চালানো', 'Driving vehicles for passenger or goods transportation'),
('রিকশাচালক', 'Rickshaw Puller', 'যাত্রী পরিবহন করা', 'Transporting passengers'),
('বাস/টেম্পো হেল্পার', 'Bus/Tempo Helper', 'যাত্রী ওঠানো-নামানো ও ভাড়া আদায়ের কাজে সাহায্য করা', 'Helping with passenger boarding-alighting and fare collection'),
('ফটোকপি ও প্রিন্টিং এর দোকান', 'Photocopy & Printing Shop', 'কাগজপত্র ফটোকপি ও প্রিন্ট করা', 'Photocopying and printing documents'),
('স্টেশনারি দোকান', 'Stationery Shop', 'লেখার সামগ্রী ও অফিসের প্রয়োজনীয় জিনিস বিক্রি করা', 'Selling writing materials and office necessities'),
('আইনজীবী', 'Lawyer', 'আইনি পরামর্শ ও সহায়তা প্রদান করা', 'Providing legal advice and assistance'),
('শিক্ষক/টিউটর', 'Teacher/Tutor', 'ছাত্রছাত্রীদের শিক্ষাদান করা', 'Teaching students'),
('কুরিয়ার সার্ভিস', 'Courier Service', 'বিভিন্ন ধরনের জিনিসপত্র এক জায়গা থেকে অন্য জায়গায় পৌঁছে দেওয়া', 'Delivering various items from one place to another'),
('ইভেন্ট প্ল্যানার', 'Event Planner', 'বিভিন্ন অনুষ্ঠান যেমন - বিয়ে, জন্মদিন ইত্যাদি পরিকল্পনা ও আয়োজন করা', 'Planning and organizing various events such as weddings, birthdays, etc.'),
('অনুবাদকারী', 'Translator', 'বিভিন্ন ভাষা থেকে অন্য ভাষায় অনুবাদ করা', 'Translating from various languages to other languages');
