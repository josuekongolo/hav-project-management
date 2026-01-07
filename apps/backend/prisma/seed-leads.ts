import { PrismaClient, ContactStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface LeadData {
  company: {
    name: string;
    industry?: string;
    website?: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
    employees?: number;
    revenue?: number;
  };
  contacts: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    website?: string;
    source?: string;
    notes?: string;
    status?: ContactStatus;
  }[];
}

const leads: LeadData[] = [
  // TIER 1: TOP PRIORITY (1-10)

  // 1. COSMAX USA
  {
    company: {
      name: 'COSMAX USA',
      industry: 'Cosmetic ODM/OEM',
      website: 'https://www.cosmax.com',
      description: "World's leading cosmetic ODM ($1.3B revenue). Handles new supplier relationships with direct access to Asia operations.",
      phone: '(440) 600-5639',
      email: 'sales1@cosmax.com',
      address: '9th Fl., Krafton Tower, 117 Bundangnaegong-Ro, Bundang-Gu, Seongnam-Si, Gyeonggi-Do 13529',
      city: 'Ridgefield Park',
      country: 'USA / Korea',
      revenue: 1300000000,
    },
    contacts: [
      {
        firstName: 'Garrett',
        lastName: 'Crozier',
        email: 'sales1@cosmax.com',
        phone: '(440) 600-5639',
        website: 'https://linkedin.com/in/garrett-crozier-78a3867',
        source: 'Lead Research',
        notes: 'Director of Business Development. 17 years experience in cosmetic/medical device/drug manufacturing. Cross-functional work with Procurement, Quality, Operations, R&D. TALKING POINTS: Cod-derived PDRN differentiation; Norwegian sustainability; pharmaceutical-grade quality for K-beauty brands.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 2. iNOVA PHARMACEUTICALS
  {
    company: {
      name: 'iNOVA Pharmaceuticals',
      industry: 'Pharmaceutical Distribution',
      website: 'https://www.inovapharma.com',
      description: 'Pan-Asian pharmaceutical distributor (8 countries). Operates in Singapore, Hong Kong, Japan, Malaysia, Philippines, Thailand, Indonesia. Focuses on hospital/healthcare providers. Partnership with Carlyle Group/Pacific Equity Partners.',
      phone: '+65 6340-3540',
      address: 'One Temasek Avenue, #04-01 Millenia Tower',
      city: 'Singapore',
      country: 'Singapore',
    },
    contacts: [
      {
        firstName: 'Dan',
        lastName: 'Spira',
        email: 'dan.spira@inovapharma.com',
        source: 'Lead Research',
        notes: 'Group CEO. Former J&J VP, Bausch Health Managing Director. TALKING POINTS: Medical-grade PDRN for wound healing/regenerative medicine; Asia-wide distribution capability.',
        status: ContactStatus.LEAD,
      },
      {
        firstName: 'Gautam',
        lastName: 'Suri',
        email: 'gautam.suri@inovapharma.com',
        website: 'https://linkedin.com/in/gautam-suri',
        source: 'Lead Research',
        notes: 'Managing Director Asia, P&L ~40% of operations. Former Beiersdorf Regional Head Asia Pac, J&J APAC Lead.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 3. KOLMAR KOREA
  {
    company: {
      name: 'Kolmar Korea Co., Ltd.',
      industry: 'Cosmetic ODM/OEM',
      website: 'https://kolmarbnh.co.kr/en/',
      description: "Korea's first ODM company. Comprehensive end-to-end services. Opening second U.S. plant in 2026. Aggressive global expansion. 5 business day response guarantee on inquiries.",
      phone: '+82.2.515.0150',
      address: '61, 8-gil, Heolleung-ro, Seocho-gu',
      city: 'Seoul',
      country: 'Korea',
    },
    contacts: [
      {
        firstName: 'Yongchul',
        lastName: 'Hur',
        email: 'inquiry@kolmarbnh.co.kr',
        source: 'Lead Research',
        notes: 'CEO, North America. Former Amore Pacific factory manager. TALKING POINTS: Submit inquiry emphasizing cod-PDRN differentiation; follow up with Singapore office for ASEAN market penetration.',
        status: ContactStatus.LEAD,
      },
      {
        firstName: 'Philippe',
        lastName: 'Warnery',
        email: 'global@kolmarbnh.co.kr',
        source: 'Lead Research',
        notes: 'Global Chief Commercial Officer. Former CEO Intercos North America.',
        status: ContactStatus.LEAD,
      },
      {
        firstName: 'Ian',
        lastName: 'Kang',
        email: 'innovation@kolmarbnh.co.kr',
        source: 'Lead Research',
        notes: 'VP Innovation & Engineering. 20+ years supply chain expertise.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 4. DERMAT INDIA
  {
    company: {
      name: 'Dermat India',
      industry: 'PDRN Manufacturing',
      description: "India's leading PDRN manufacturer. First-mover in Indian market (12.5% CAGR fastest growth). ISO/GMP certified. Korean R&D collaboration.",
      phone: '+91-8448990340',
      email: 'dermatindia@gmail.com',
      address: '696, Pace City-II, SEC-37',
      city: 'Gurugram, Haryana',
      country: 'India',
    },
    contacts: [
      {
        firstName: 'Sameep',
        lastName: 'Jain',
        email: 'dermatindia@gmail.com',
        phone: '+91-8448990340',
        website: 'https://linkedin.com/in/sameep-jain-87aa3388',
        source: 'Lead Research',
        notes: 'Partner/Co-Founder. 5 years 8 months at Dermat India. 8 years 10 months as Managing Partner at A.S Lifesciences. WhatsApp available. TALKING POINTS: Cod-PDRN as alternative source for Indian market; partnership for Tier-2/Tier-3 city expansion; cost-competitive Norwegian quality.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 5. AMOREPACIFIC
  {
    company: {
      name: 'AMOREPACIFIC',
      industry: 'Multinational Beauty Conglomerate',
      website: 'https://www.amorepacific.com',
      description: 'Multinational conglomerate (16 women\'s beauty brands, 30+ countries). Recently launched PDRN-infused body care (Illiyoon). Emphasis on sustainable ingredient sourcing. "Beautiful Fair Trade" program.',
      phone: '+65 6737 4988',
      email: 'corporate@amorepacific.com',
      address: '8 Cross Street, Level 25, Manulife Tower',
      city: 'Singapore',
      country: 'Singapore',
    },
    contacts: [
      {
        firstName: 'Brian',
        lastName: 'Lee',
        email: 'brian.lee@amorepacific.com',
        source: 'Lead Research',
        notes: 'VP of Business Development, New York office. TALKING POINTS: Approach Singapore HQ for Asia-wide ingredient sourcing; Norwegian sustainability aligns with "Beautiful Fair Trade" program; pharmaceutical-grade quality for cosmeceutical lines.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 6. NEOASIA SINGAPORE
  {
    company: {
      name: 'NEOASIA (S) PTE LTD',
      industry: 'Medical Aesthetics Distribution',
      website: 'https://www.neoasiagroup.com',
      description: 'Founded 1995. 6-country distribution network (Singapore, Indonesia, Malaysia, Philippines, Vietnam). Distributes Heliocare, Candela, HydraFacial, Profhilo. Ideal regional distributor for injectable PDRN. Revenue: $16.9 Million.',
      phone: '+65 6552 7787',
      email: 'info@neoasiagroup.com',
      address: '6 Tagore Drive #04-07, Tagore Building',
      city: 'Singapore',
      country: 'Singapore',
      revenue: 16900000,
    },
    contacts: [
      {
        firstName: 'NeoAsia',
        lastName: 'Sales',
        email: 'info@neoasiagroup.com',
        phone: '+65 6552 7787',
        source: 'Lead Research',
        notes: 'TALKING POINTS: Position cod-PDRN as complement to Profhilo; medical aesthetics network across clinics/hospitals; regulatory expertise in Southeast Asia. Regional contacts: Indonesia +62 21 2265 1440, Malaysia +603 7865 7717, Vietnam +84 28 39110241.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 7. APR CORP / MEDICUBE
  {
    company: {
      name: 'APR Corp / Medicube',
      industry: 'K-Beauty / Beauty Tech',
      website: 'https://www.medicube.com',
      description: 'APR Corp went public in 2025. Medicube is fastest-growing PDRN brand in Korea. Pink PDRN Line is leading K-beauty PDRN brand. CEO is public-facing ("CEOppa" TikTok marketing).',
      phone: '+82 2 6335 0574',
      address: '36th floor, 300 Olympic-ro, Songpa-gu',
      city: 'Seoul',
      country: 'Korea',
    },
    contacts: [
      {
        firstName: 'Byunghoon Victor',
        lastName: 'Kim',
        email: 'ir@apr.co.kr',
        phone: '+82 70 4667 1770',
        website: 'https://instagram.com/byunghoon_victor_kim',
        source: 'Lead Research',
        notes: 'Founder & CEO. Net Worth: USD $2.2 billion (Forbes, November 2025). 35K Instagram followers. TALKING POINTS: Cod-PDRN differentiation for next-generation Medicube formulations; Norwegian quality for premium beauty tech devices; supply chain diversification from salmon sources.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 8. KALBE FARMA
  {
    company: {
      name: 'PT Kalbe Farma Tbk',
      industry: 'Pharmaceutical',
      website: 'https://www.kalbefarma.com',
      description: "Southeast Asia's largest pharmaceutical company (USD $3.9B valuation). Covers 100% of Indonesian hospitals/pharmacies. 1M+ outlets distribution. 95% raw material imports. Overseas vendor registration available.",
      phone: '+62 21 4287 3888',
      email: 'info@kalbe.co.id',
      address: 'Kalbe Building, 3rd Floor, Jalan Letjend. Suprapto Kav. 4',
      city: 'Jakarta',
      country: 'Indonesia',
      revenue: 3900000000,
    },
    contacts: [
      {
        firstName: 'Maria',
        lastName: 'Dewanti',
        email: 'procurement@kalbe.co.id',
        source: 'Lead Research',
        notes: 'Purchasing Manager. TALKING POINTS: Register as overseas vendor at e-proc.kalbe.co.id/registration_import; pharmaceutical-grade PDRN for prescription and consumer health divisions; halal certification opportunity (deadline Oct 2026).',
        status: ContactStatus.LEAD,
      },
      {
        firstName: 'Maureen',
        lastName: 'Katharina',
        email: 'pharma.procurement@kalbe.co.id',
        source: 'Lead Research',
        notes: 'Purchasing Head, Pharma Division.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 9. BLACKBIRD SKINCARE
  {
    company: {
      name: 'Blackbird Skincare',
      industry: 'Private Label Skincare',
      website: 'https://www.blackbirdskincare.com',
      description: 'Active PDRN manufacturer serving U.S. private label market. 11-product PDRN line (serums, ampoules, masks, creams). Long-term client relationships with major beauty brands.',
      email: 'web@blackbirdtrade.com',
      address: 'Room 308, No.23 Building, No.5 Jihua Road, Chancheng District',
      city: 'Foshan, Guangdong',
      country: 'China',
    },
    contacts: [
      {
        firstName: 'Jonas',
        lastName: 'Chan',
        email: 'web@blackbirdtrade.com',
        website: 'https://linkedin.com/in/jonas-chan-45a094279',
        source: 'Lead Research',
        notes: 'Sales Manager for Private Label Skincare (U.S. Market). 9 years 9 months experience (since September 2015). TALKING POINTS: Cod-PDRN as differentiated ingredient for private label clients; Norwegian sustainability narrative for U.S. consumers; competitive pricing for trial orders.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 10. SHISEIDO
  {
    company: {
      name: 'Shiseido Company, Limited',
      industry: 'Global Beauty',
      website: 'https://corp.shiseido.com',
      description: 'Global beauty powerhouse. Asia-Pacific HQ in Singapore handles regional ingredient sourcing. Emphasis on ethical sourcing, traceability, sustainable plant-based ingredients. Active R&D in biotechnology. 1,000+ researchers globally.',
      phone: '+65 6331 4555',
      address: '182 Cecil Street, Frasers Tower, #18-01',
      city: 'Singapore',
      country: 'Singapore',
    },
    contacts: [
      {
        firstName: 'Shiseido',
        lastName: 'Procurement',
        email: 'inquiry@shiseido.com.sg',
        phone: '+65 6331 4555',
        source: 'Lead Research',
        notes: 'Professional Division: 401 Commonwealth Dr, #03-01/02 Haw Par Technocentre, Singapore 149598 | +65 6424 7015. TALKING POINTS: Norwegian cod as sustainable, traceable PDRN source; alignment with Shiseido\'s ingredient policy; premium positioning for Asia-focused product lines; scientific validation.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // TIER 2: HIGH-PRIORITY (11-20)

  // 11. COSMAX - Julie Lee
  {
    company: {
      name: 'COSMAX USA CORPORATION - Marketing',
      industry: 'Cosmetic ODM/OEM',
      website: 'https://www.cosmax.com',
      description: 'Same as main COSMAX entry - Strategic Marketing division.',
      city: 'Fort Lee',
      country: 'New Jersey, USA',
    },
    contacts: [
      {
        firstName: 'Julie',
        lastName: 'Lee',
        email: 'julie.lee@cosmax.com',
        website: 'https://linkedin.com/in/julie-lee-1030771b5',
        source: 'Lead Research',
        notes: 'Senior Manager of Strategic Marketing and Product Development. 9 years innovation development. Brought in 30+ new customers ($1M+ revenue). Former Amorepacific intern. Leads 2-year innovation pipeline development with R&D. Presents to 100+ customers. Expertise in US/Korea/China markets.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 12. COSMAX - Erica A
  {
    company: {
      name: 'COSMAX USA CORPORATION - BD',
      industry: 'Cosmetic ODM/OEM',
      website: 'https://www.cosmax.com',
      city: 'Ridgefield Park',
      country: 'New Jersey, USA',
    },
    contacts: [
      {
        firstName: 'Erica',
        lastName: 'A.',
        email: 'erica@cosmax.com',
        website: 'https://linkedin.com/in/erica-a-42355641',
        source: 'Lead Research',
        notes: 'New Business Development Manager. Direct role in sourcing new ingredients and suppliers. 137 professional connections.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 13. LG H&H
  {
    company: {
      name: 'LG Household & Health Care, Ltd.',
      industry: 'Cosmetics & Health Care',
      website: 'https://www.lghnh.com',
      description: "Korea's first modern cosmetics maker (1947). Owns OHUI, Whoo, Su:m, ISA KNOX brands. 4,325 employees. $5.1B revenue.",
      phone: '+82 808 505 330',
      address: 'LG GwangHwaMoon Building, 58 Saemunan-ro, Jongno-gu',
      city: 'Seoul',
      country: 'Korea',
      employees: 4325,
      revenue: 5100000000,
    },
    contacts: [
      {
        firstName: 'Sungin',
        lastName: 'Youn',
        email: 'procurement@lghnh.com',
        source: 'Lead Research',
        notes: 'Procurement Manager/Team Leader.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 14. FOSUN PHARMACEUTICAL
  {
    company: {
      name: 'Shanghai Fosun Pharmaceutical Group',
      industry: 'Pharmaceutical',
      website: 'https://www.fosunpharma.com',
      description: 'Major Chinese pharma conglomerate. Member of China Pharmaceutical Innovation R&D Association.',
      phone: '+86-21-33987000',
      email: 'int@fosunpharma.com',
      city: 'Shanghai',
      country: 'China',
    },
    contacts: [
      {
        firstName: 'Fosun',
        lastName: 'International BD',
        email: 'int@fosunpharma.com',
        source: 'Lead Research',
        notes: 'International Business contact. Business Development: invest@fosunpharma.com',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 15. TJCY Pharmaceutical
  {
    company: {
      name: 'Tianjin Chengyi International Trading Co., Ltd.',
      industry: 'Pharmaceutical Raw Materials',
      website: 'https://www.tjcypharma.com',
      description: 'Established 1999. 20+ years pharmaceutical raw materials trading. Global logistics network with warehouses in Qingdao, Shanghai, São Paulo, Breda (Netherlands).',
      address: '8th floor 5th Building, No. 95 South Sports Road, Xiaodian District',
      city: 'Taiyuan, Shanxi',
      country: 'China',
    },
    contacts: [
      {
        firstName: 'TJCY',
        lastName: 'Sales',
        email: 'sales@tjcypharma.com',
        source: 'Lead Research',
        notes: 'Pharmaceutical raw materials trading company with global logistics.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 16. BIOCROWN BIOTECHNOLOGY - Taiwan
  {
    company: {
      name: 'Biocrown Biotechnology Co., Ltd.',
      industry: 'Cosmetic Manufacturing',
      website: 'https://www.biocrown.com.tw',
      description: "Taiwan's first GMP-certified full-scale cosmetics manufacturer. Established 1977 (48 years experience). Certifications: ISO 22716:2008, ISO 14001:2015, GMP, BSCI, COSMOS/ECOCERT. New Douliu factory opened March 2025 with automated production lines.",
      country: 'Taiwan',
    },
    contacts: [
      {
        firstName: 'Biocrown',
        lastName: 'Sales',
        email: 'sales@biocrown.com.tw',
        source: 'Lead Research',
        notes: 'Ingredient-driven R&D. Responsive to business inquiries. Instagram: @biocrown_biotechnology',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 17. TCI BIO - Taiwan
  {
    company: {
      name: 'TCI Bio',
      industry: 'Biotech R&D',
      website: 'https://www.tci-bio.com',
      description: 'Advanced R&D & validation. Skincare and beauty supplements. Clinical testing capabilities suitable for pharmaceutical-grade PDRN applications.',
      country: 'Taiwan',
    },
    contacts: [
      {
        firstName: 'TCI',
        lastName: 'Business Development',
        email: 'info@tci-bio.com',
        source: 'Lead Research',
        notes: 'Clinical testing capabilities for PDRN applications.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 18. UNICARE BIOTECH - Taiwan
  {
    company: {
      name: 'Unicare Biotech',
      industry: 'Private Label Skincare',
      website: 'https://unicare.com.tw',
      description: 'Private label skincare manufacturer. ODM experience with international brands. Export to 12 countries.',
      country: 'Taiwan',
    },
    contacts: [
      {
        firstName: 'Unicare',
        lastName: 'Export',
        email: 'export@unicare.com.tw',
        source: 'Lead Research',
        notes: 'ODM experience with international brands.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 19. BO INTERNATIONAL - India
  {
    company: {
      name: 'Bo International',
      industry: 'Cosmetic Manufacturing',
      website: 'https://bointernational.net',
      description: 'FSSAI approved, Kosher/Halal certified. 10+ years cosmetic manufacturing. Natural ingredient-based products. Global exports. Alignment with sustainability narrative.',
      country: 'India',
    },
    contacts: [
      {
        firstName: 'Bo',
        lastName: 'International',
        email: 'info@bointernational.net',
        source: 'Lead Research',
        notes: 'Natural ingredient-based products with sustainability focus.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 20. SWADESH INDIA CHEMICAL
  {
    company: {
      name: 'Swadesh India Chemical Pvt Ltd',
      industry: 'Cosmetic Raw Materials',
      description: 'ISO/GMP certified. Cosmetic-grade actives, emollients, surfactants. Export to Asia, Middle East, Europe, Africa, Latin America. Established raw material supplier to Indian cosmetic industry.',
      country: 'India',
    },
    contacts: [
      {
        firstName: 'Swadesh',
        lastName: 'Sales',
        email: 'sales@swadeshindia.com',
        source: 'Lead Research',
        notes: 'Established raw material supplier with global export capability.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 21. PHARMACOS INDIA
  {
    company: {
      name: 'Pharmacos India',
      industry: 'Cosmetic Raw Materials',
      website: 'https://pharmacos.in',
      description: 'Cosmetic raw materials. Custom formulations. Product development for skin care, hair care, color cosmetics. Quality-focused ingredient supplier.',
      country: 'India',
    },
    contacts: [
      {
        firstName: 'Pharmacos',
        lastName: 'Formulations',
        email: 'info@pharmacos.in',
        source: 'Lead Research',
        notes: 'Custom formulations and product development.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 22-23. SOE MEDICAL - Thailand
  {
    company: {
      name: 'SOE Medical Co., Ltd.',
      industry: 'Medical Aesthetics Distribution',
      description: 'Leading importer/distributor of medical aesthetics devices in Thailand. Since December 2019.',
      city: 'Bangkok',
      country: 'Thailand',
    },
    contacts: [
      {
        firstName: 'Nicha',
        lastName: 'Thiantravan',
        email: 'nicha@soemedical.co.th',
        website: 'https://linkedin.com/in/nananicha',
        source: 'Lead Research',
        notes: 'Executive Director. Education: University of San Francisco.',
        status: ContactStatus.LEAD,
      },
      {
        firstName: 'Chutipapha',
        lastName: 'Thiantravan',
        email: 'chutipapha@soemedical.co.th',
        website: 'https://linkedin.com/in/chutipapha-thiantravan-06357b306',
        source: 'Lead Research',
        notes: 'Business Owner. Decision-maker for new product sourcing and partnerships.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 24-25. ALLIANCE HEALTHCARE - Singapore
  {
    company: {
      name: 'Alliance Healthcare Group Limited',
      industry: 'Healthcare Distribution',
      description: 'Licensed by HSA Singapore. Specializes in pre-registered medicines and orphan drugs. 35+ years in medical industry. Founded 2006. GP clinics and specialist care.',
      city: 'Singapore',
      country: 'Singapore',
    },
    contacts: [
      {
        firstName: 'Chien Yeh',
        lastName: 'Wong',
        email: 'chienyeh.wong@alliancehealthcare.com.sg',
        website: 'https://linkedin.com/in/chien-yeh-wong-a8024a120',
        source: 'Lead Research',
        notes: 'Managing Director / Head of Pharmaceutical Services at Alliance Pharm Pte Ltd. 2004-2008 Managing Director Pharmagape Healthcare.',
        status: ContactStatus.LEAD,
      },
      {
        firstName: 'Barry',
        lastName: 'Thng',
        email: 'barry.thng@alliancehealthcare.com.sg',
        website: 'https://linkedin.com/in/barry-alliancehealthcare',
        source: 'Lead Research',
        notes: 'Executive Chairman & CEO. Dr. Barry Thng Lip Mong. Former Singapore General Hospital consultant. Strategic decision-maker for pharmaceutical procurement.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 26. CAPSULE PHARMA - Singapore
  {
    company: {
      name: 'Capsule Pharma Pte Ltd',
      industry: 'Pharmaceutical Distribution',
      description: 'GDPMDS & GDPMD certified. Wholesale, distribution, licensed storage, product registration, clinical trial logistics. Cold-chain shipments. Human & Veterinary Medicine. Medical Devices. Import-of-record services.',
      city: 'Singapore',
      country: 'Singapore',
    },
    contacts: [
      {
        firstName: 'Capsule',
        lastName: 'Pharma',
        email: 'info@capsulepharma.com.sg',
        source: 'Lead Research',
        notes: 'Handles temperature-sensitive products suitable for PDRN.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 27. ZIWELL MEDICAL - Singapore
  {
    company: {
      name: 'Ziwell Medical',
      industry: 'Pharmaceutical Distribution',
      phone: '+65 6749 1693',
      email: 'info@ziwellmedical.com',
      address: 'No. 1 Ubi Crescent #05-03 Number One Building',
      city: 'Singapore',
      country: 'Singapore',
    },
    contacts: [
      {
        firstName: 'Ziwell',
        lastName: 'Medical',
        email: 'info@ziwellmedical.com',
        phone: '+65 6749 1693',
        source: 'Lead Research',
        notes: 'Singapore pharmaceutical distributor.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 28. VT COSMETICS
  {
    company: {
      name: 'VT Cosmetics Inc.',
      industry: 'K-Beauty',
      description: 'Leading PDRN brand in Korea with extensive product line. Products: PDRN Essence 100, PDRN Cica Exosome Ampoule. Distribution: Olive Young, Sephora, Amazon, Tmall, Shopee. High-volume customer potential.',
      phone: '1661-9456',
      address: '23, Samseong-ro 76-gil, Gangnam-gu',
      city: 'Seoul',
      country: 'Korea',
    },
    contacts: [
      {
        firstName: 'VT Cosmetics',
        lastName: 'Business',
        email: 'business@vtcosmetics.com',
        phone: '1661-9456',
        source: 'Lead Research',
        notes: 'Registration Number: 539-85-01130. High-volume PDRN customer potential.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 29. ANUA
  {
    company: {
      name: 'Anua',
      industry: 'K-Beauty',
      description: 'Viral Korean skincare brand. 40M+ products sold globally. Rapidly growing. Wholesale available through MiiN Trade, Qogita platforms.',
      email: 'help@anua.us',
      country: 'Korea',
    },
    contacts: [
      {
        firstName: 'Anua',
        lastName: 'Business',
        email: 'help@anua.us',
        source: 'Lead Research',
        notes: 'Business Hours: Mon-Fri 10:00-18:00 (KST). Potential for PDRN product development.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 30. K-SECRET COSMETICS
  {
    company: {
      name: 'K-SECRET Cosmetics',
      industry: 'K-Beauty Export',
      description: 'Exported to 70+ countries. Wholesale partnerships available.',
      email: 'business@aj-int.com',
      country: 'Korea',
    },
    contacts: [
      {
        firstName: 'K-Secret',
        lastName: 'Business',
        email: 'business@aj-int.com',
        source: 'Lead Research',
        notes: 'Marketing & PR: marketing@aj-int.com. Customer Service: ksecret@aj-int.com',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // TIER 3: STRATEGIC (31-40)

  // 31. DERMASTER - Thailand
  {
    company: {
      name: 'Dermaster Co., Ltd.',
      industry: 'Medical Aesthetics Clinic',
      description: 'Premier wellness and aesthetic institute. 4 branches in Bangkok. 5,000+ clients (high-end market). Services: Plastic surgery, aesthetic treatments, body slimming, hair transplantation. Premium PDRN treatment provider.',
      city: 'Bangkok',
      country: 'Thailand',
    },
    contacts: [
      {
        firstName: 'Dermaster',
        lastName: 'Business',
        email: 'info@dermaster.co.th',
        source: 'Lead Research',
        notes: 'Luxurious facilities. Direct clinical application for premium PDRN treatments.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 32. ASIA COSMETIC HOSPITAL - Thailand
  {
    company: {
      name: 'Asia Cosmetic Hospital',
      industry: 'Medical Aesthetics',
      description: 'JCI-accredited. FDA-approved lasers and devices. Well-known in Thailand for injectable treatments market.',
      country: 'Thailand',
    },
    contacts: [
      {
        firstName: 'Tanongsak',
        lastName: 'Panyawirunroj',
        email: 'info@asiacosmetichospital.com',
        source: 'Lead Research',
        notes: 'Medical Director. Injectable treatments market.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 33. YANHEE HOSPITAL - Thailand
  {
    company: {
      name: 'Yanhee Hospital',
      industry: 'Multi-Specialty Hospital',
      description: '400-bed medically licensed institution. International patients from 162 countries. Multi-specialty with extensive cosmetic/plastic surgery.',
      country: 'Thailand',
    },
    contacts: [
      {
        firstName: 'Supot',
        lastName: 'Sumritvanitcha',
        email: 'info@yanheehospital.com',
        source: 'Lead Research',
        notes: 'Founder. International reach for cosmetic procedures.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 34. NIRUNDA CLINIC - Thailand
  {
    company: {
      name: 'Nirunda International Aesthetic Clinic',
      industry: 'Medical Aesthetics',
      description: '2 operation rooms, 7 treatment rooms, cell processing unit. Languages: English, Japanese, Chinese, Korean, Spanish, Bahasa, French. International clientele.',
      country: 'Thailand',
    },
    contacts: [
      {
        firstName: 'Krittiporn',
        lastName: 'Pengsuk',
        email: 'info@nirundaclinic.com',
        source: 'Lead Research',
        notes: 'President. Multilingual staff, advanced facilities.',
        status: ContactStatus.LEAD,
      },
      {
        firstName: 'Vorachai',
        lastName: 'Chuenchompoonut',
        email: 'medical@nirundaclinic.com',
        source: 'Lead Research',
        notes: 'Medical Director.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 35. KALBE INTERNATIONAL
  {
    company: {
      name: 'Kalbe International Pte. Ltd.',
      industry: 'Pharmaceutical Export',
      website: 'https://kalbeinternational.com',
      description: 'Handles international ingredient procurement and export operations for Kalbe Farma group. Operations in 12 countries (Singapore, Cambodia, Malaysia, Myanmar, Philippines, Vietnam, Sri Lanka, South Africa, Nigeria, Thailand, UAE).',
      address: 'Komplek Kalbe Pulomas, Jl. Pulomas Selatan No.2',
      city: 'Jakarta Timur',
      country: 'Indonesia',
    },
    contacts: [
      {
        firstName: 'Kalbe',
        lastName: 'International',
        email: 'info@kalbeinternational.com',
        source: 'Lead Research',
        notes: 'International procurement and export operations.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 36. BBG TRADA INDONESIA
  {
    company: {
      name: 'PT BBG Trada Indonesia',
      industry: 'Import/Export',
      description: 'Established Guangzhou, China (Feb 2021). Export/import supplier, distributor. Wholesale cosmetics and medical equipment. Imports raw materials from China and abroad for Indonesian market.',
      city: 'Jakarta',
      country: 'Indonesia',
    },
    contacts: [
      {
        firstName: 'BBG',
        lastName: 'Trada',
        email: 'info@bbgtrada.co.id',
        source: 'Lead Research',
        notes: 'Imports raw materials for Indonesian market.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 37. RICH BEAUTY INTERNATIONAL - Hong Kong
  {
    company: {
      name: 'Rich Beauty International Limited',
      industry: 'Beauty Distribution',
      phone: '+852 3543 8000',
      email: 'info@richbeauty.hk',
      address: '13/F Everwin Centre, No. 72 Hung To Road, Kwun Tong',
      city: 'Hong Kong',
      country: 'Hong Kong',
    },
    contacts: [
      {
        firstName: 'Rich Beauty',
        lastName: 'HK',
        email: 'info@richbeauty.hk',
        phone: '+852 3543 8000',
        source: 'Lead Research',
        notes: 'Hong Kong gateway to Greater China. China production plants.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 38. GLOBAL COSMETICS HK
  {
    company: {
      name: 'Global Cosmetics (HK) Company Limited',
      industry: 'Cosmetic Trading',
      phone: '+852 2522 2811',
      address: 'Unit 5-7, 3/F Empire Ctr 68 Mody Rd Tsim Sha Tsui',
      city: 'Kowloon',
      country: 'Hong Kong',
    },
    contacts: [
      {
        firstName: 'Global Cosmetics',
        lastName: 'HK',
        email: 'info@globalcosmetics.hk',
        phone: '+852 2522 2811',
        source: 'Lead Research',
        notes: 'China Factory: Gaobao Science and Technology City, Dongguan City | +86 769 83392980',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 39. HK FULL BEAUTY GROUP
  {
    company: {
      name: 'Hong Kong Full Beauty Group Limited',
      industry: 'Beauty Trading',
      phone: '+852 2763 7588',
      address: 'Room 112 & 115, A Block Cambridge Plaza, 188 San Wan Road, Sheung Shui',
      city: 'Hong Kong',
      country: 'Hong Kong',
    },
    contacts: [
      {
        firstName: 'Full Beauty',
        lastName: 'Group',
        email: 'info@hkfullbeauty.com',
        phone: '+852 2763 7588',
        source: 'Lead Research',
        notes: '10+ years branded cosmetics and perfumes trading.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // 40. EIG Malaysia
  {
    company: {
      name: 'Esthetics International Group',
      industry: 'Professional Beauty Distribution',
      description: 'Listed on Bursa Malaysia. 33+ years experience. 70+ corporate outlets (Malaysia, Singapore, Hong Kong, Thailand). Brands: Dermalogica, Davines, Tisserand Aromatherapy. ASEAN market leader in professional beauty distribution.',
      country: 'Malaysia',
    },
    contacts: [
      {
        firstName: 'EIG',
        lastName: 'Business',
        email: 'business@eig.com.my',
        source: 'Lead Research',
        notes: 'Vast salon network across ASEAN.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // Additional strategic contacts (41-50)
  {
    company: {
      name: 'Shandong Topscience Biotech',
      industry: 'Biochemical API',
      description: 'Biochemical API producer. GMP/DMF/ISO certified.',
      country: 'China',
    },
    contacts: [
      {
        firstName: 'Topscience',
        lastName: 'Sales',
        email: 'sales@topscience.cn',
        source: 'Lead Research',
        notes: 'Biochemical API producer.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'Focuschem',
      industry: 'PDRN Ingredients',
      description: 'PDRN ingredients supplier, China.',
      country: 'China',
    },
    contacts: [
      {
        firstName: 'Focuschem',
        lastName: 'Sales',
        email: 'sales@focuschem.cn',
        source: 'Lead Research',
        notes: 'PDRN ingredients supplier.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'Zancheng Life Sciences',
      industry: 'API Raw Materials',
      description: 'API raw materials, China.',
      country: 'China',
    },
    contacts: [
      {
        firstName: 'Zancheng',
        lastName: 'Sales',
        email: 'sales@zancheng.cn',
        source: 'Lead Research',
        notes: 'API raw materials supplier.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'China Beauty Expo',
      industry: 'Trade Show',
      email: 'ibe.sales@informa.com',
      description: 'Trade show organizer for beauty industry.',
      country: 'China',
    },
    contacts: [
      {
        firstName: 'CBE',
        lastName: 'Sales',
        email: 'ibe.sales@informa.com',
        source: 'Lead Research',
        notes: 'Trade show for partnership opportunities.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'Dr. Wu Skincare',
      industry: 'Premium Skincare',
      description: 'Taiwan premium skincare brand.',
      country: 'Taiwan',
    },
    contacts: [
      {
        firstName: 'Dr. Wu',
        lastName: 'Business',
        email: 'business@drwu.com.tw',
        source: 'Lead Research',
        notes: 'Taiwan premium brand.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'Evergoods',
      industry: 'Mass Production Manufacturing',
      description: 'Taiwan mass production manufacturer.',
      country: 'Taiwan',
    },
    contacts: [
      {
        firstName: 'Evergoods',
        lastName: 'Sales',
        email: 'sales@evergoods.com.tw',
        source: 'Lead Research',
        notes: 'Mass production capabilities.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'UMMA Platform',
      industry: 'K-Beauty Platform',
      email: 'cs@umma.io',
      description: '180+ brands, Seoul HQ.',
      city: 'Seoul',
      country: 'Korea',
    },
    contacts: [
      {
        firstName: 'UMMA',
        lastName: 'Platform',
        email: 'cs@umma.io',
        source: 'Lead Research',
        notes: '180+ K-beauty brands.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'Q-Depot Platform',
      industry: 'Wholesale Platform',
      website: 'https://wholesale.q-depot.com',
      description: '300+ brands wholesale platform.',
      country: 'Korea',
    },
    contacts: [
      {
        firstName: 'Q-Depot',
        lastName: 'Wholesale',
        email: 'wholesale@q-depot.com',
        source: 'Lead Research',
        notes: '300+ brands.',
        status: ContactStatus.LEAD,
      },
    ],
  },

  // TIER 4: Regional offices (51-60)
  {
    company: {
      name: 'AMOREPACIFIC Jakarta',
      industry: 'Beauty',
      phone: '+62 21 5084 7400',
      city: 'Jakarta',
      country: 'Indonesia',
    },
    contacts: [
      {
        firstName: 'Amorepacific',
        lastName: 'Jakarta',
        email: 'corporate@amorepacific.co.id',
        phone: '+62 21 5084 7400',
        source: 'Lead Research',
        notes: 'Indonesia regional office.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'AMOREPACIFIC Kuala Lumpur',
      industry: 'Beauty',
      phone: '+60 3 2289 7888',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
    },
    contacts: [
      {
        firstName: 'Amorepacific',
        lastName: 'KL',
        email: 'corporate@amorepacific.com.my',
        phone: '+60 3 2289 7888',
        source: 'Lead Research',
        notes: 'Malaysia regional office.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'AMOREPACIFIC Delhi',
      industry: 'Beauty',
      phone: '+91 1244 055 640',
      city: 'Delhi',
      country: 'India',
    },
    contacts: [
      {
        firstName: 'Amorepacific',
        lastName: 'Delhi',
        email: 'corporate@amorepacific.co.in',
        phone: '+91 1244 055 640',
        source: 'Lead Research',
        notes: 'India regional office.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'AMOREPACIFIC Tokyo',
      industry: 'Beauty',
      phone: '+81 3 5561 6800',
      city: 'Tokyo',
      country: 'Japan',
    },
    contacts: [
      {
        firstName: 'Amorepacific',
        lastName: 'Tokyo',
        email: 'corporate@amorepacific.co.jp',
        phone: '+81 3 5561 6800',
        source: 'Lead Research',
        notes: 'Japan regional office.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'AMOREPACIFIC Ho Chi Minh',
      industry: 'Beauty',
      phone: '+84 28 3824 6232',
      city: 'Ho Chi Minh City',
      country: 'Vietnam',
    },
    contacts: [
      {
        firstName: 'Amorepacific',
        lastName: 'HCM',
        email: 'corporate@amorepacific.com.vn',
        phone: '+84 28 3824 6232',
        source: 'Lead Research',
        notes: 'Vietnam regional office.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'KOR Japan - THE STEM CELL',
      industry: 'PDRN Manufacturing',
      description: 'THE STEM CELL PDRN manufacturer.',
      country: 'Japan',
    },
    contacts: [
      {
        firstName: 'KOR Japan',
        lastName: 'Sales',
        email: 'info@korjapan.co.jp',
        source: 'Lead Research',
        notes: 'PDRN manufacturer.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'Dermatics International',
      industry: 'Medical Distribution',
      description: 'Singapore/Hong Kong/Indonesia/Vietnam/Malaysia/Taiwan distributor.',
      city: 'Singapore',
      country: 'Singapore',
    },
    contacts: [
      {
        firstName: 'Dermatics',
        lastName: 'International',
        email: 'info@dermatics.com',
        source: 'Lead Research',
        notes: 'Multi-country medical distribution.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'MDDConnect Sdn Bhd',
      industry: 'Medical Distribution',
      description: 'Malaysia MD Dermatics products.',
      country: 'Malaysia',
    },
    contacts: [
      {
        firstName: 'MDD',
        lastName: 'Connect',
        email: 'info@mddconnect.com.my',
        source: 'Lead Research',
        notes: 'MD Dermatics products.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'Venusys Medical',
      industry: 'Medical Equipment',
      description: 'Malaysia/Singapore operations.',
      country: 'Malaysia',
    },
    contacts: [
      {
        firstName: 'Venusys',
        lastName: 'Medical',
        email: 'info@venusys.com.my',
        source: 'Lead Research',
        notes: 'Malaysia/Singapore operations.',
        status: ContactStatus.LEAD,
      },
    ],
  },
  {
    company: {
      name: 'AESLA',
      industry: 'Medical Distribution',
      description: 'Licensed medical distributor, Thailand.',
      country: 'Thailand',
    },
    contacts: [
      {
        firstName: 'AESLA',
        lastName: 'Thailand',
        email: 'info@aesla.co.th',
        source: 'Lead Research',
        notes: 'Licensed medical distributor.',
        status: ContactStatus.LEAD,
      },
    ],
  },
];

async function main() {
  console.log('🚀 Starting to seed CRM leads...\n');

  let companiesCreated = 0;
  let contactsCreated = 0;
  let skippedContacts = 0;

  for (const lead of leads) {
    try {
      // Create or find company
      let company = await prisma.company.findFirst({
        where: { name: lead.company.name },
      });

      if (!company) {
        company = await prisma.company.create({
          data: {
            name: lead.company.name,
            industry: lead.company.industry,
            website: lead.company.website,
            description: lead.company.description,
            phone: lead.company.phone,
            email: lead.company.email,
            address: lead.company.address,
            city: lead.company.city,
            country: lead.company.country,
            employees: lead.company.employees,
            revenue: lead.company.revenue,
          },
        });
        companiesCreated++;
        console.log(`✅ Created company: ${company.name}`);
      } else {
        console.log(`ℹ️  Company exists: ${company.name}`);
      }

      // Create contacts for this company
      for (const contact of lead.contacts) {
        // Check if contact exists
        const existingContact = await prisma.contact.findUnique({
          where: { email: contact.email },
        });

        if (!existingContact) {
          await prisma.contact.create({
            data: {
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              phone: contact.phone,
              website: contact.website,
              source: contact.source || 'Lead Research',
              notes: contact.notes,
              status: contact.status || ContactStatus.LEAD,
              companyId: company.id,
            },
          });
          contactsCreated++;
          console.log(`   ✅ Created contact: ${contact.firstName} ${contact.lastName}`);
        } else {
          skippedContacts++;
          console.log(`   ⚠️  Contact exists: ${contact.email}`);
        }
      }
    } catch (error: any) {
      console.error(`❌ Error processing ${lead.company.name}:`, error.message);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Companies created: ${companiesCreated}`);
  console.log(`   Contacts created: ${contactsCreated}`);
  console.log(`   Contacts skipped (already exist): ${skippedContacts}`);
  console.log('\n✨ Seed completed!');
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
