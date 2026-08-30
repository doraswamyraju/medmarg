package com.medmarg.patient.data

import com.medmarg.patient.model.*

object SampleDataProvider {

    val popularTests = listOf(
        DiagnosticTest(
            id = "t_lipid",
            name = "Lipid Profile (Complete Cholesterol)",
            category = "Heart Health",
            sampleType = "Blood",
            fastingRequiredHours = 12,
            description = "Measures Total Cholesterol, HDL, LDL, Triglycerides & VLDL to assess cardiovascular risk.",
            parametersCount = 8,
            tags = listOf("Bestseller", "Fasting Required", "Same-Day Report"),
            labPricings = listOf(
                LabTestPricing(
                    labId = "lab_1",
                    labName = "Apollo Diagnostics",
                    rating = 4.8,
                    reviewCount = 1420,
                    isNabl = true,
                    isCapAccredited = true,
                    distanceKm = 1.8,
                    originalPrice = 850,
                    discountedPrice = 499,
                    tatHours = 6,
                    homeCollectionAvailable = true,
                    homeCollectionFee = 0
                ),
                LabTestPricing(
                    labId = "lab_2",
                    labName = "Dr. Lal PathLabs",
                    rating = 4.7,
                    reviewCount = 2890,
                    isNabl = true,
                    isCapAccredited = true,
                    distanceKm = 2.4,
                    originalPrice = 900,
                    discountedPrice = 549,
                    tatHours = 8,
                    homeCollectionAvailable = true,
                    homeCollectionFee = 50
                ),
                LabTestPricing(
                    labId = "lab_3",
                    labName = "Thyrocare Central Lab",
                    rating = 4.6,
                    reviewCount = 3100,
                    isNabl = true,
                    distanceKm = 3.2,
                    originalPrice = 750,
                    discountedPrice = 399,
                    tatHours = 12,
                    homeCollectionAvailable = true,
                    homeCollectionFee = 0
                ),
                LabTestPricing(
                    labId = "lab_4",
                    labName = "Metropolis Healthcare",
                    rating = 4.7,
                    reviewCount = 980,
                    isNabl = true,
                    distanceKm = 4.1,
                    originalPrice = 950,
                    discountedPrice = 599,
                    tatHours = 6,
                    homeCollectionAvailable = true,
                    homeCollectionFee = 0
                )
            )
        ),
        DiagnosticTest(
            id = "t_hba1c",
            name = "HbA1c (Glycosylated Hemoglobin)",
            category = "Diabetes Care",
            sampleType = "Blood",
            fastingRequiredHours = 0,
            description = "Measures average blood sugar levels over the past 2-3 months. No fasting required.",
            parametersCount = 2,
            tags = listOf("No Fasting", "Diabetes Monitoring", "Quick TAT"),
            labPricings = listOf(
                LabTestPricing(
                    labId = "lab_3",
                    labName = "Thyrocare Central Lab",
                    rating = 4.6,
                    reviewCount = 3100,
                    isNabl = true,
                    distanceKm = 3.2,
                    originalPrice = 600,
                    discountedPrice = 299,
                    tatHours = 6,
                    homeCollectionAvailable = true,
                    homeCollectionFee = 0
                ),
                LabTestPricing(
                    labId = "lab_1",
                    labName = "Apollo Diagnostics",
                    rating = 4.8,
                    reviewCount = 1420,
                    isNabl = true,
                    isCapAccredited = true,
                    distanceKm = 1.8,
                    originalPrice = 650,
                    discountedPrice = 349,
                    tatHours = 4,
                    homeCollectionAvailable = true,
                    homeCollectionFee = 0
                ),
                LabTestPricing(
                    labId = "lab_2",
                    labName = "Dr. Lal PathLabs",
                    rating = 4.7,
                    reviewCount = 2890,
                    isNabl = true,
                    isCapAccredited = true,
                    distanceKm = 2.4,
                    originalPrice = 700,
                    discountedPrice = 399,
                    tatHours = 6,
                    homeCollectionAvailable = true,
                    homeCollectionFee = 50
                )
            )
        ),
        DiagnosticTest(
            id = "t_thyroid",
            name = "Thyroid Profile Total (T3, T4, TSH)",
            category = "Hormone & Metabolism",
            sampleType = "Blood",
            fastingRequiredHours = 8,
            description = "Comprehensive assessment of thyroid gland functioning and metabolism rate.",
            parametersCount = 3,
            tags = listOf("Fasting Preferred", "Hormones"),
            labPricings = listOf(
                LabTestPricing(
                    labId = "lab_3",
                    labName = "Thyrocare Central Lab",
                    rating = 4.6,
                    reviewCount = 3100,
                    isNabl = true,
                    distanceKm = 3.2,
                    originalPrice = 650,
                    discountedPrice = 299,
                    tatHours = 10,
                    homeCollectionAvailable = true,
                    homeCollectionFee = 0
                ),
                LabTestPricing(
                    labId = "lab_1",
                    labName = "Apollo Diagnostics",
                    rating = 4.8,
                    reviewCount = 1420,
                    isNabl = true,
                    distanceKm = 1.8,
                    originalPrice = 750,
                    discountedPrice = 449,
                    tatHours = 6,
                    homeCollectionAvailable = true,
                    homeCollectionFee = 0
                )
            )
        ),
        DiagnosticTest(
            id = "t_cbc",
            name = "Complete Blood Count (CBC) with ESR",
            category = "General Health",
            sampleType = "Blood",
            fastingRequiredHours = 0,
            description = "Measures red cells, white cells, platelets, and hemoglobin to detect infections and anemia.",
            parametersCount = 24,
            tags = listOf("Standard Health Check", "No Fasting"),
            labPricings = listOf(
                LabTestPricing(
                    labId = "lab_1",
                    labName = "Apollo Diagnostics",
                    rating = 4.8,
                    reviewCount = 1420,
                    isNabl = true,
                    distanceKm = 1.8,
                    originalPrice = 450,
                    discountedPrice = 299,
                    tatHours = 4,
                    homeCollectionAvailable = true,
                    homeCollectionFee = 0
                ),
                LabTestPricing(
                    labId = "lab_2",
                    labName = "Dr. Lal PathLabs",
                    rating = 4.7,
                    reviewCount = 2890,
                    isNabl = true,
                    distanceKm = 2.4,
                    originalPrice = 480,
                    discountedPrice = 320,
                    tatHours = 5,
                    homeCollectionAvailable = true,
                    homeCollectionFee = 50
                )
            )
        )
    )

    val scanServices = listOf(
        ScanService(
            id = "scan_mri_brain",
            name = "MRI Brain (Plain + Angio)",
            modality = "MRI",
            bodyPart = "Brain & Head",
            preparation = "Remove all metallic objects, jewelry, and belts. Inform staff if you have pacemakers or metal implants.",
            durationMinutes = 30,
            precautions = "Safe & Radiation-free (Magnetic Resonance)",
            centerPricings = listOf(
                ScanCenterPricing(
                    centerId = "sc_1",
                    centerName = "Aarthi Scans & Labs",
                    machineSpec = "Siemens 3.0 Tesla Silent MRI",
                    price = 3499,
                    originalPrice = 6000,
                    distanceKm = 2.1,
                    rating = 4.8,
                    nextSlot = "Today, 5:00 PM",
                    address = "100ft Road, Indiranagar"
                ),
                ScanCenterPricing(
                    centerId = "sc_2",
                    centerName = "Medall Diagnostic & MRI Center",
                    machineSpec = "GE Optima 1.5T Wide Bore",
                    price = 2999,
                    originalPrice = 5200,
                    distanceKm = 3.5,
                    rating = 4.6,
                    nextSlot = "Today, 6:30 PM",
                    address = "Koramangala 4th Block"
                ),
                ScanCenterPricing(
                    centerId = "sc_3",
                    centerName = "Manipal Advanced Radiology",
                    machineSpec = "Philips Ingenia 3.0T Digital",
                    price = 4500,
                    originalPrice = 7500,
                    distanceKm = 4.8,
                    rating = 4.9,
                    nextSlot = "Tomorrow, 9:00 AM",
                    address = "Old Airport Road"
                )
            )
        ),
        ScanService(
            id = "scan_ct_chest",
            name = "HRCT Chest (High Resolution CT)",
            modality = "CT Scan",
            bodyPart = "Lungs & Chest",
            preparation = "Fasting for 4 hours if contrast dye is advised. Wear comfortable loose clothing.",
            durationMinutes = 15,
            precautions = "Ultra Low Dose Radiation Protocol",
            centerPricings = listOf(
                ScanCenterPricing(
                    centerId = "sc_1",
                    centerName = "Aarthi Scans & Labs",
                    machineSpec = "128-Slice Low Radiation CT",
                    price = 2499,
                    originalPrice = 4500,
                    distanceKm = 2.1,
                    rating = 4.8,
                    nextSlot = "Today, 4:00 PM",
                    address = "100ft Road, Indiranagar"
                ),
                ScanCenterPricing(
                    centerId = "sc_4",
                    centerName = "Focus Imaging & Scan Center",
                    machineSpec = "64-Slice High Speed CT",
                    price = 2199,
                    originalPrice = 4000,
                    distanceKm = 3.1,
                    rating = 4.5,
                    nextSlot = "Today, 7:15 PM",
                    address = "Domlur Layout"
                )
            )
        ),
        ScanService(
            id = "scan_usg_abdomen",
            name = "Ultrasound Whole Abdomen & Pelvis",
            modality = "Ultrasound",
            bodyPart = "Abdomen & Pelvis",
            preparation = "Full bladder required. Drink 4-5 glasses of water 1 hour prior and do not urinate before scan.",
            durationMinutes = 20,
            precautions = "100% Safe, Zero Radiation",
            centerPricings = listOf(
                ScanCenterPricing(
                    centerId = "sc_1",
                    centerName = "Aarthi Scans & Labs",
                    machineSpec = "4D Color Doppler HD USG",
                    price = 1199,
                    originalPrice = 2000,
                    distanceKm = 2.1,
                    rating = 4.8,
                    nextSlot = "Today, 3:30 PM",
                    address = "100ft Road, Indiranagar"
                ),
                ScanCenterPricing(
                    centerId = "sc_2",
                    centerName = "Medall Diagnostic Center",
                    machineSpec = "GE Voluson Matrix Ultrasound",
                    price = 999,
                    originalPrice = 1800,
                    distanceKm = 3.5,
                    rating = 4.6,
                    nextSlot = "Tomorrow, 10:00 AM",
                    address = "Koramangala 4th Block"
                )
            )
        )
    )

    val doctorsList = listOf(
        Doctor(
            id = "doc_1",
            name = "Dr. Ananya Sharma",
            specialty = "General Physician & Diabetologist",
            experienceYears = 14,
            qualification = "MBBS, MD (Internal Medicine)",
            clinicOrHospital = "MedMarg Care Clinic & Apollo Telehealth",
            rating = 4.9,
            reviewsCount = 420,
            fee = 499,
            isAvailableVideo = true,
            isAvailableClinic = true,
            nextSlot = "In 15 mins"
        ),
        Doctor(
            id = "doc_2",
            name = "Dr. Rajeshwar Rao",
            specialty = "Cardiologist",
            experienceYears = 22,
            qualification = "MBBS, MD, DM (Cardiology), FACC",
            clinicOrHospital = "Heart Wellness Institute",
            rating = 4.95,
            reviewsCount = 890,
            fee = 800,
            isAvailableVideo = true,
            isAvailableClinic = true,
            nextSlot = "Today, 5:30 PM"
        ),
        Doctor(
            id = "doc_3",
            name = "Dr. Priya Deshmukh",
            specialty = "Dermatologist & Trichologist",
            experienceYears = 9,
            qualification = "MBBS, DVD, MD (Dermatology)",
            clinicOrHospital = "Skin & Aesthetic Clinic",
            rating = 4.85,
            reviewsCount = 310,
            fee = 600,
            isAvailableVideo = true,
            isAvailableClinic = false,
            nextSlot = "Today, 4:00 PM"
        )
    )

    val medicinesList = listOf(
        Medicine(
            id = "med_1",
            name = "Lipaglyn 4mg Tablet",
            composition = "Saroglitazar (4mg)",
            manufacturer = "Zydus Healthcare",
            mrp = 345,
            price = 289,
            packSize = "Strip of 10 tablets",
            isPrescriptionRequired = true,
            genericAlternative = GenericAlt(
                name = "Saroglitazar 4mg (MedMarg Generic)",
                manufacturer = "MedMarg Generics Lab",
                mrp = 220,
                discountedPrice = 135,
                savingsPercent = 53
            )
        ),
        Medicine(
            id = "med_2",
            name = "Augmentin 625 Duo Tablet",
            composition = "Amoxycillin (500mg) + Clavulanic Acid (125mg)",
            manufacturer = "GlaxoSmithKline Pharmaceuticals",
            mrp = 223,
            price = 189,
            packSize = "Strip of 10 tablets",
            isPrescriptionRequired = true,
            genericAlternative = GenericAlt(
                name = "Amoxyclav 625 (Generic Quality Certified)",
                manufacturer = "Cipla Generic Care",
                mrp = 150,
                discountedPrice = 99,
                savingsPercent = 48
            )
        ),
        Medicine(
            id = "med_3",
            name = "Shelcal 500mg Tablet",
            composition = "Calcium (500mg) + Vitamin D3 (250 IU)",
            manufacturer = "Torrent Pharmaceuticals",
            mrp = 142,
            price = 119,
            packSize = "Bottle of 15 tablets",
            isPrescriptionRequired = false,
            genericAlternative = null
        )
    )

    val healthRecords = listOf(
        HealthRecord(
            id = "rec_1",
            title = "Complete Lipid Profile",
            provider = "Apollo Diagnostics",
            date = "24 Aug 2026",
            category = "Pathology Report",
            biomarkers = listOf(
                Biomarker("Total Cholesterol", "215", "mg/dL", "< 200", BiomarkerStatus.HIGH),
                Biomarker("HDL (Good Cholesterol)", "52", "mg/dL", "> 40", BiomarkerStatus.NORMAL),
                Biomarker("LDL (Bad Cholesterol)", "138", "mg/dL", "< 100", BiomarkerStatus.HIGH),
                Biomarker("Triglycerides", "145", "mg/dL", "< 150", BiomarkerStatus.NORMAL)
            )
        ),
        HealthRecord(
            id = "rec_2",
            title = "HbA1c & Fasting Glucose",
            provider = "Thyrocare Central Lab",
            date = "15 Jul 2026",
            category = "Diabetes Monitoring",
            biomarkers = listOf(
                Biomarker("HbA1c Glycated Hemoglobin", "5.8", "%", "< 5.7 (Normal)", BiomarkerStatus.BORDERLINE),
                Biomarker("Fasting Blood Sugar", "94", "mg/dL", "70 - 99", BiomarkerStatus.NORMAL)
            )
        )
    )

    val insurancePolicies = listOf(
        InsurancePolicy(
            id = "ins_1",
            providerName = "Star Health & Allied Insurance",
            policyNumber = "SH-MED-88392147",
            sumInsured = "₹10,00,000",
            validTill = "18 Mar 2027",
            membersCovered = listOf("Self (Rahul)", "Spouse (Priya)", "Child (Aarav)"),
            cashlessLabsCount = 180
        )
    )
}
