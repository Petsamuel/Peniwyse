export const STEPS = ['Entity Info', 'UBOs', 'Entity Shareholders', 'Directors', 'Contact & Declaration', 'CDD Questionnaire', 'Documents']

export const TITLES = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof']

export const ENTITY_TYPES = [
    'SoleProprietorship',
    'Limited Liability Company',
    'Partnership',
    'Corporation',
    'Trust',
    'Non-Profit Organization',
    'Other',
]

export const SECTORS = [
    'E-commerce Support Services',
    'Financial Services',
    'Healthcare',
    'Technology',
    'Manufacturing',
    'Retail',
    'Real Estate',
    'Agriculture',
    'Education',
    'Consulting',
    'Other',
]

export const COUNTRIES = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Cameroon', 'Senegal',
    'Ethiopia', 'Egypt', 'Morocco', 'Tanzania', 'Uganda', 'Rwanda',
    'United Kingdom', 'United States', 'Canada', 'Germany', 'France',
    'Netherlands', 'UAE', 'Saudi Arabia', 'China', 'India', 'Singapore', 'Other',
]

export const ENTRIES_PER_PAGE_OPTIONS = [5, 10, 25, 50]

export interface EntityInfo {
    legalName: string
    previousLegalName: string
    entityType: string
    primaryLineOfBusiness: string
    businessTaxTin: string
    sector: string
    registeredAddress: string
    operationalAddress: string
    isRegulated: boolean
    regulatoryBodyLicenseNumber: string
    countriesWhereClientsAreBased: string
    intendedPurpose: string
}

export interface UBO {
    title: string
    fullName: string
    address: string
    shareholding: string
    nationality: string
}

export interface EntityShareholder {
    entityName: string
    // entityName: StringConstructor
    shareholding: string
    address: string
}

export interface Director {
    title: string
    fullname: string
    address: string
    dateOfBirth: string
    nationality: string
}

export interface Contact {
    fullName: string
    phoneNumber: string
    email: string
    jobTitle: string
}

export interface Declaration {
    individualCompanyName: string
    contactPersonNamePosition: string
    idNinCompanyNumber: string
    individualCompanyAddress: string
    authorizedSignature: string
    date: string
}

export const STEPPER_HEIGHT = 82.54
export const STEPPER_OVERHANG = 72