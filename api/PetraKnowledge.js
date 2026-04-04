export const petraKnowledge = {
    company: "Petra Design",
    aka: ["Petra Cast", "Petra Design Toronto"],
    website: "petracast.ca",
    location: "Toronto/GTA, Ontario, Canada",
    contact: { 
        phone: "416-746-9668", 
        email: "info@petracast.ca",
        address: "47 St. Regis Crescent, North York, ON M3J 1Y6, Canada" 
    },

    // DANH MỤC SẢN PHẨM (PETRA DESIGN PRODUCTS)
    products: {
        exterior: {
            materials: ["GFRC", "Fiberglass (FRP)", "Precast Concrete", "UHPC"],
            items: [
                "Facade Cladding", "Columns (Classic & Modern)", "Entrance Porch", 
                "Window and Door Surrounds", "Sills", "Crown Moulding", 
                "Cornices", "Parapet", "Arch", "Dome", "Minaret", 
                "Fountain", "Bench", "Planters", "Balustrades"
            ]
        },
        interior: {
            materials: ["Plaster (GRG)", "Fiberglass (FRP)"],
            items: [
                "Fireplace Mantels", "Overmantel", "Kitchen Hoods", 
                "Ceiling Tiles", "Domes", "Light Coves", 
                "Custom Ornamentation", "Wall Panels"
            ]
        },
        customization: "Unlimited colors and textures. All products can be custom-mixed in Petra’s in-house labs to match any architectural requirement."
    },

    // Đội ngũ nhân sự chuyên nghiệp
    team: {
        ceo: {
            name: "Mr. Mahmoud",
            role: "CEO & Founder",
            bio: "Expert with over 20 years in Architectural Precast & GFRC. The visionary behind Petra Design's prestige."
        },
        estimators: {
            names: ["Mr. Abed", "Mr. Neel"],
            role: "Senior Estimators",
            specialty: "Precise material takeoffs and project bidding. Contact them for competitive quotes."
        },
        designers: {
            names: ["Ms. Contessa", "Mr. Arbaz"],
            role: "CAD Designers & Technical Leads",
            skills: ["AutoCAD", "3D Modeling", "SketchUp", "Complex Surface Design", "Catia"]
        },
        production_leads: {
            names: ["Mr. Danilo", "Mr. Cam", "Mr. Tiger"],
            role: "Master Carpenters & Lead Tool Makers",
            skills: ["Mould Fabrication", "Buck Construction", "CNC Programming", "MasterCam", "Precision Tooling"]
        }
    },

    // Các dự án nổi bật
    notable_projects: [
        { name: "Ellie Tower Condominium", city: "Toronto", type: "Architectural Precast Facade", link: "https://petracast.com/projects/ellie-tower-condominium/" },
        { name: "CN Tower Overview", city: "Toronto", type: "Specialized Concrete Works", link: "https://petracast.com/projects/cn-tower-overview/" },
        { name: "La Fontaine Tunnel Renovations", city: "Montreal/Quebec", type: "Heavy Infrastructure Precast", link: "https://petracast.com/projects/la-fontaine-tunnel-renovations/" },
        { name: "Custom GRG Terracotta Ceiling", city: "Toronto", type: "High-end Interior GRG", link: "https://petracast.com/projects/custom-grg-terracotta-ceiling/" },
        { name: "Leadcar Honda", city: "Automotive Sector", type: "Modern Commercial Facade", link: "https://petracast.com/projects/leadcar-honda/" },
        { name: "4 Old Kingston Road Mosque", city: "Toronto", type: "GFRC Domes & Islamic Architecture", link: "https://petracast.com/projects/4-old-kingston-road-mosque/" },
        { name: "EQ Bank Tower", city: "Toronto", type: "Office Tower GFRC/Precast", link: "https://petracast.com/projects/eq-bank-tower/" },
        { name: "Kingsdale Avenue", city: "Toronto", type: "Luxury Residential Precast", link: "https://petraprecast.ca/gallery/kingsdale-avenue" },
        { name: "GFRC Urban Bench & Planters", city: "Public Spaces", type: "Street Furniture & Site Furnishings", link: "https://petracast.com/projects/gfrc-urban-bench-planters/" },
        { name: "Outdoor Projects", city: "Various Locations", type: "Custom Columns, Balustrades & Fireplaces", link: "https://petracast.com/projects/outdoor-projects/" }
    ],

    // Vật liệu chuyên sâu & Thông số kỹ thuật
    core_materials: {
        gfrc: {
            name: "Glass Fiber Reinforced Concrete",
            description: "75% lighter than traditional concrete. High flexural strength.",
            composition: ["Cement", "Sand", "Water", "Glass Fibers", "Additives"],
            benefits: ["Fire-resistant Class A", "Non-combustible (UL/ULC compliant)", "Impact resistance"],
            fire_rating: "Class A / Non-combustible. Zero smoke development and flame spread.",
            applications: ["Cornices", "Columns", "Facades", "Planters"]
        },
        uhpc: {
            name: "Ultra-High Performance Concrete",
            strength: "> 130 MPa (19,000 PSI)",
            composition: ["Sand", "Cement", "Water", "PVA Fiber", "Admixtures"],
            panel_details: {
                max_custom_dimensions: "60\" x 144\"",
                standard_thickness: "5/8\"",
                max_custom_thickness: "1 5/8\""
            }
        },
        grg: { 
            name: "Glass Fiber Reinforced Gypsum", 
            usage: "Interior ceilings & ornate details",
            fire_rating: "Class A Fire Rated (Non-combustible)"
        },
        frp: { name: "Fiber Reinforced Polymer (Fiberglass)", usage: "Corrosion resistant architectural elements, exterior & interior" }
    },

    // Phân loại kết cấu xây dựng
    structural_types: {
        solid_slabs: { 
            pros: "Strength, load bearing", 
            cons: "Heavy weight",
            fire_rating: "Naturally high fire resistance (up to 4 hours depending on thickness)"
        },
        hollow_core_slabs: { 
            pros: "Lightweight, long span", 
            cons: "Lower acoustic insulation",
            fire_rating: "Standard 1 to 2-hour rating (OBC Compliant)"
        },
        beams: { shapes: ["T-beams", "L-beams", "I-beams"], usage: "Deck & Roof support" },
        columns: { shapes: ["Round", "Square", "Rectangular"], usage: "Parking & Commercial supports" }
    },

    // Năng lực xưởng
    capabilities: {
        engineering: ["Load-bearing calcs", "Structural optimization", "Shop drawings"],
        mould_making: {
            craft: "Master Carpentry, Tool Maker, Mould Maker",
            tech: ["5-axis CNC", "Catia (3D)", "MasterCam (CNC Paths)", "AutoCAD"],
            types: ["Silicone", "Fiberglass", "High-density Foam"]
        },
        production: "Full in-house manufacturing at our Toronto North York facility.",
        installation: "White-glove installation service across GTA."
    }
};