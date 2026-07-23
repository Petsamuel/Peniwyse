'use client'

import { useState } from 'react'
import { Dancing_Script } from 'next/font/google'
import FieldInput from '../components/field-input'
import FieldSelect from '../components/field-select'
import { useSubmitCddQuestionnaire } from '@/app/hooks/use-onboarding'
import { COUNTRIES, SECTORS } from './type'
import { FileUploadZone } from '../components/file-upload-zone'
import DatePicker from '../components/date-picker'
import { getApiErrorMessage } from '../utils/error-message'
import { motion, AnimatePresence } from 'framer-motion'

const signatureFont = Dancing_Script({ subsets: ['latin'], weight: ['700'] })

type YesNo = 'yes' | 'no' | null
type QuestionType = 'yesno' | 'text'

interface AmlQuestion {
    text: string
    type: QuestionType
    apiField: string
}

interface AmlSection {
    key: string
    title: string
    questions: AmlQuestion[]
}

const NATURE_OF_BUSINESS_OPTIONS = [
    'Aggregator', 'IMTO', 'PSSP/PSS',
    'FinTech', 'Mobile Money Transfer', 'Savings & Loans',
    'Investment', 'Others (Specify)',
]

const LEGAL_STATUS_OPTIONS = [
    'Sole Proprietorship', 'Limited Liability Company', 'Partnership',
    'Public Limited Company', 'NGO / Non-Profit', 'Government Entity', 'Other',
]

const SANCTION_LISTS = ['EU', 'OFAC', 'UN', 'UK HM Treasury']

const AML_SECTIONS: AmlSection[] = [
    {
        key: 'amlPolicies',
        title: 'AML Policies, Practices & Due Diligence',
        questions: [
            { text: 'Does your organisation have a documented AML/CFT policy approved by senior management?', type: 'yesno', apiField: 'hasDocumentedAMLPolicy' },
            { text: 'How frequently is the AML/CFT policy reviewed and updated?', type: 'text', apiField: 'amlPolicyReviewFrequency' },
            { text: 'Does your organisation conduct a formal risk assessment of its exposure to money laundering?', type: 'yesno', apiField: 'conductsRiskAssessment' },
            { text: 'Is there a designated Money Laundering Reporting Officer (MLRO) or Compliance Officer?', type: 'yesno', apiField: 'hasMoneyLaunderingOfficer' },
            { text: 'Does your organisation maintain written AML/CFT procedures and controls?', type: 'yesno', apiField: 'hasWrittenAMLProcedures' },
            { text: 'Are AML/CFT responsibilities clearly assigned across departments?', type: 'yesno', apiField: 'isAMLResponsibilitiesClearlyAssigned' },
        ],
    },
    {
        key: 'riskAssessment',
        title: 'Risk Assessment',
        questions: [
            { text: 'Does the Client have a risk-based assessment of its customer base covering transactions, product demand and geographical location?', type: 'yesno', apiField: 'hasRiskBasedCustomerAssessment' },
            { text: 'Does the Client determine appropriate levels of enhanced due diligence for high-risk customer categories?', type: 'yesno', apiField: 'appliesEnhancedDueDiligence' },
            { text: 'Does the Company transact business with clients in DPRK, Iran, Myanmar, or other FATF High Risk jurisdictions?', type: 'yesno', apiField: 'operatesInHighRiskCountries' },
            { text: "Does the Company's line of business involve: illegal activities, weapons, adult entertainment, unregistered gambling, illegal substances, human trafficking, or environmental harm?", type: 'yesno', apiField: 'involvedInHighRiskIndustries' },
        ],
    },
    {
        key: 'kycDueDiligence',
        title: 'KYC Due Diligence',
        questions: [
            { text: 'Has the Client implemented processes for identification of customers on whose behalf it maintains accounts or conducts transactions?', type: 'yesno', apiField: 'hasImplementedIdentificationProcess' },
            { text: "Does the Client have a requirement to collect information regarding its customers' business activities?", type: 'yesno', apiField: 'collectsCustomerBusinessInformation' },
            { text: "Does the Client assess its client customers' AML policies or practices?", type: 'yesno', apiField: 'assessesCustomerAMLPolicies' },
            { text: 'Does the Client have a process to review and update customer information relating to high-risk client information?', type: 'yesno', apiField: 'reviewsHighRiskCustomers' },
            { text: 'Does the Client have procedures to establish a record for each new customer noting identification documents and KYC information?', type: 'yesno', apiField: 'maintainsCustomerRecords' },
            { text: 'Does the Client complete a risk-based assessment to understand the normal and expected transactions of its customers?', type: 'yesno', apiField: 'performsRiskAssessmentOnCustomers' },
        ],
    },
    {
        key: 'reportableTransactions',
        title: 'Reportable Transactions & Prevention of Illicit Funds',
        questions: [
            { text: 'Does your organisation have a process to identify and report suspicious transactions to relevant authorities?', type: 'yesno', apiField: 'hasTransactionsIdentifyingPolicies' },
            { text: 'Are Suspicious Activity Reports (SARs) or Suspicious Transaction Reports (STRs) filed promptly?', type: 'yesno', apiField: 'hasIdentifyingProceduresStructuring' },
            { text: 'Does your organisation maintain records of all reported transactions and disclosures?', type: 'yesno', apiField: 'isCustomerAndTransactionScreened' },
            { text: 'Is there a policy to prevent tipping off customers when a suspicious report has been filed?', type: 'yesno', apiField: 'hasPoliciesWithBanks' },
            { text: 'Do you have controls in place to prevent facilitating transactions that may involve illicit funds?', type: 'yesno', apiField: 'hasWolfsbergTransparencyPrinciples' },
        ],
    },
    {
        key: 'transactionMonitoring',
        title: 'Transaction Monitoring',
        questions: [
            { text: 'Does the Client have a monitoring program for unusual and potentially suspicious activity including funds transfers?', type: 'yesno', apiField: 'hasMonitoringProgram' },
            { text: 'Does the Entity have policies, procedures and processes to review and escalate matters from transaction monitoring?', type: 'yesno', apiField: 'hasEscalationProcess' },
            { text: 'What is the method used by the Entity to monitor transactions for suspicious activities?', type: 'text', apiField: 'transactionMonitorMethod' },
            { text: 'If manual or combination selected — specify what type of transactions are monitored manually', type: 'text', apiField: 'manualMonitoringDetails' },
        ],
    },
    {
        key: 'amlTraining',
        title: 'AML Training',
        questions: [
            { text: 'Does the Client provide AML training to relevant employees covering: identification/reporting requirements, money laundering examples, and internal policies?', type: 'yesno', apiField: 'providesAMLTraining' },
            { text: 'Does the Client retain records of AML training sessions including attendance records and training materials used?', type: 'yesno', apiField: 'retainsAMLTrainingRecords' },
            { text: 'Does the Client communicate new AML-related laws or changes to existing AML policies to relevant employees?', type: 'yesno', apiField: 'communicatesAMLPolicyUpdates' },
            { text: 'Does the Client employ third parties to carry out some of the functions of the Client?', type: 'yesno', apiField: 'usesThirdParties' },
        ],
    },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function YesNoPills({ value, onChange }: { value: YesNo; onChange: (v: YesNo) => void }) {
    return (
        <div className="flex items-center gap-2 mt-2">
            {(['yes', 'no'] as const).map(opt => {
                const active = value === opt
                return (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => onChange(opt)}
                        className={`flex items-center gap-2 px-5 py-1.5 rounded-xl border text-sm font-semibold transition-all ${
                            active 
                                ? 'bg-[#185fa5] border-[#185fa5] text-white' 
                                : 'bg-card-bg border-border-theme text-muted-theme hover:border-border-theme hover:bg-surface-hover'
                        }`}
                    >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? 'border-white' : 'border-border-theme'}`}>
                            {active && <div className="w-1.5 h-1.5 rounded-full bg-card-bg" />}
                        </div>
                        {opt === 'yes' ? 'Yes' : 'No'}
                    </button>
                )
            })}
        </div>
    )
}

function SectionHeader({ 
    num, 
    title, 
    questionCount, 
    status, 
    open, 
    onClick 
}: { 
    num: number; 
    title: string; 
    questionCount: number; 
    status: 'Done' | 'In progress' | 'Not started'; 
    open: boolean;
    onClick: () => void 
}) {
    const statusColor = {
        'Done': 'text-green-500',
        'In progress': 'text-[#185fa5]',
        'Not started': 'text-muted-theme'
    }[status]

    return (
        <button
            onClick={onClick}
            className="w-full flex items-start gap-4 py-6 text-left transition-all hover:bg-surface-hover/50 group"
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                open || status === 'Done' ? 'bg-[#185fa5] text-white' : 'bg-surface-hover text-muted-theme'
            }`}>
                {num}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
                <h3 className={`text-base font-semibold transition-colors ${open ? 'text-foreground' : 'text-muted-theme'}`}>{title}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                    <span className="text-muted-theme">{questionCount} questions</span>
                    <span className="text-gray-200">/</span>
                    <span className={statusColor}>{status}</span>
                </p>
            </div>
            <svg
                className={`w-5 h-5 text-muted-theme transition-transform mt-1 shrink-0 ${open ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CddQuestionnaire({ tradingPartnerId, onNext }: {
    tradingPartnerId: string
    onNext: () => void
}) {
    // ─── STATE ───
    const [openSection, setOpenSection] = useState<string>('general')

    // General Information
    const [hasPepUbo, setHasPepUbo] = useState<YesNo>(null)
    const [hasPepDirector, setHasPepDirector] = useState<YesNo>(null)
    const [pepName, setPepName] = useState('')
    const [pepRole, setPepRole] = useState('')
    const [pepRelationship, setPepRelationship] = useState('')
    const [pepOwnershipPercentage, setPepOwnershipPercentage] = useState('')
    const [countriesOfOperation, setCountriesOfOperation] = useState('')
    const [numberOfLocations, setNumberOfLocations] = useState('')
    const [yearsInBusiness, setYearsInBusiness] = useState('')
    const [natureOfBusiness, setNatureOfBusiness] = useState('')
    const [legalStatus, setLegalStatus] = useState('')
    const [othersSpecification, setOthersSpecification] = useState('')
    const [pepCountry, setPepCountry] = useState('') 

    // Regulatory & Compliance
    const [requiresCbApproval, setRequiresCbApproval] = useState<YesNo>(null)
    const [cbApprovalDetails, setCbApprovalDetails] = useState('')
    const [subjectToAmlReg, setSubjectToAmlReg] = useState<YesNo>(null)
    const [amlRegName, setAmlRegName] = useState('')
    const [amlRegAuthority, setAmlRegAuthority] = useState('')
    const [amlRegCountry, setAmlRegCountry] = useState('')
    const [hasLegalClaims, setHasLegalClaims] = useState<YesNo>(null)
    const [legalClaimsDetails, setLegalClaimsDetails] = useState('')
    const [hasWrittenAmlPolicy, setHasWrittenAmlPolicy] = useState<YesNo>(null)
    const [auditorsInfo, setAuditorsInfo] = useState('')
    const [sanctionLists, setSanctionLists] = useState<string[]>([])
    const [files, setFiles] = useState<File[]>([])

    // AML section answers
    const [amlAnswers, setAmlAnswers] = useState<Record<string, (YesNo | string)[]>>(
        Object.fromEntries(
            AML_SECTIONS.map(s => [
                s.key,
                s.questions.map(q => (q.type === 'yesno' ? null : '')) as (YesNo | string)[],
            ])
        )
    )

    // Authorization
    const [authorizedFullname, setAuthorizedFullname] = useState('')
    const [position, setPosition] = useState('')
    const [date, setDate] = useState('')

    const [error, setError] = useState<string | null>(null)
    const { mutate, isPending } = useSubmitCddQuestionnaire()

    // ─── HELPERS ───
    const setAmlAnswer = (sectionKey: string, qIndex: number, value: YesNo | string) =>
        setAmlAnswers(prev => ({
            ...prev,
            [sectionKey]: prev[sectionKey].map((v, i) => i === qIndex ? value : v),
        }))

    const toggleSanctionList = (item: string) =>
        setSanctionLists(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])

    const amlBool = (sectionKey: string, qIndex: number): boolean =>
        amlAnswers[sectionKey][qIndex] === 'yes'

    const amlStr = (sectionKey: string, qIndex: number): string =>
        (amlAnswers[sectionKey][qIndex] as string) || ''

    // ─── STATUS CALCULATIONS ───
    const getGeneralStatus = () => {
        const fields = [hasPepUbo, hasPepDirector, countriesOfOperation, numberOfLocations, yearsInBusiness, natureOfBusiness, legalStatus]
        const filled = fields.filter(f => f !== null && f !== '').length
        if (filled === 0) return 'Not started'
        if (filled === fields.length) return 'Done'
        return 'In progress'
    }

    const getRegStatus = () => {
        const fields = [requiresCbApproval, subjectToAmlReg, hasLegalClaims, hasWrittenAmlPolicy, auditorsInfo, sanctionLists.length > 0]
        const filled = fields.filter(f => f !== null && f !== '' && f !== false).length
        if (filled === 0) return 'Not started'
        if (filled === fields.length) return 'Done'
        return 'In progress'
    }

    const getAmlSectionStatus = (key: string) => {
        const answers = amlAnswers[key]
        const filled = answers.filter(a => a !== null && a !== '').length
        if (filled === 0) return 'Not started'
        if (filled === answers.length) return 'Done'
        return 'In progress'
    }

    const totalSections = AML_SECTIONS.length + 3 // General, Regulatory, Authorization
    const completedSections = [
        getGeneralStatus() === 'Done',
        getRegStatus() === 'Done',
        ...AML_SECTIONS.map(s => getAmlSectionStatus(s.key) === 'Done'),
        authorizedFullname && position && date
    ].filter(Boolean).length

    const isFormValid = completedSections === totalSections

    const handleNext = () => {
        setError(null)
        const pepDetails = [pepName, pepRole, pepRelationship, pepOwnershipPercentage].filter(Boolean).join(' | ')
        mutate({
            tradingPartnerId,
            hasUltimateBeneficiaryOwner: hasPepUbo === 'yes',
            hasPEP: hasPepDirector === 'yes',
            pepDetails,
            countriesOfOperation: countriesOfOperation.split(',').map(s => s.trim()).filter(Boolean),
            numberOfLocations: parseInt(numberOfLocations) || 0,
            yearsInBusiness: parseInt(yearsInBusiness) || 0,
            natureOfBusiness: natureOfBusiness === 'Others (Specify)' ? '' : natureOfBusiness,
            otherNatureOfBusiness: othersSpecification,
            legalStatus,
            requiresCentralBankOrSECApproval: requiresCbApproval === 'yes',
            approvalDetails: cbApprovalDetails,
            compliesWithFinancialRegulation: subjectToAmlReg === 'yes',
            regulationDetails: [amlRegName, amlRegAuthority && `Authority: ${amlRegAuthority}`, amlRegCountry && `Country: ${amlRegCountry}`].filter(Boolean).join(', '),
            hasLegalClaimsOrConvictions: hasLegalClaims === 'yes',
            legalClaimsDetails,
            hasAMLPolicy: hasWrittenAmlPolicy === 'yes',
            auditorNameAndAddress: auditorsInfo,
            sanctionScreeningLists: sanctionLists.join(', '),
            hasDocumentedAMLPolicy: amlBool('amlPolicies', 0),
            amlPolicyReviewFrequency: amlStr('amlPolicies', 1),
            conductsRiskAssessment: amlBool('amlPolicies', 2),
            hasMoneyLaunderingOfficer: amlBool('amlPolicies', 3),
            hasWrittenAMLProcedures: amlBool('amlPolicies', 4),
            isAMLResponsibilitiesClearlyAssigned: amlBool('amlPolicies', 5),
            hasRiskBasedCustomerAssessment: amlBool('riskAssessment', 0),
            appliesEnhancedDueDiligence: amlBool('riskAssessment', 1),
            operatesInHighRiskCountries: amlBool('riskAssessment', 2),
            involvedInHighRiskIndustries: amlBool('riskAssessment', 3),
            hasImplementedIdentificationProcess: amlBool('kycDueDiligence', 0),
            collectsCustomerBusinessInformation: amlBool('kycDueDiligence', 1),
            assessesCustomerAMLPolicies: amlBool('kycDueDiligence', 2),
            reviewsHighRiskCustomers: amlBool('kycDueDiligence', 3),
            maintainsCustomerRecords: amlBool('kycDueDiligence', 4),
            performsRiskAssessmentOnCustomers: amlBool('kycDueDiligence', 5),
            hasTransactionsIdentifyingPolicies: amlBool('reportableTransactions', 0),
            hasIdentifyingProceduresStructuring: amlBool('reportableTransactions', 1),
            isCustomerAndTransactionScreened: amlBool('reportableTransactions', 2),
            hasPoliciesWithBanks: amlBool('reportableTransactions', 3),
            hasWolfsbergTransparencyPrinciples: amlBool('reportableTransactions', 4),
            hasMonitoringProgram: amlBool('transactionMonitoring', 0),
            hasEscalationProcess: amlBool('transactionMonitoring', 1),
            transactionMonitorMethod: amlStr('transactionMonitoring', 2),
            manualMonitoringDetails: amlStr('transactionMonitoring', 3),
            providesAMLTraining: amlBool('amlTraining', 0),
            retainsAMLTrainingRecords: amlBool('amlTraining', 1),
            communicatesAMLPolicyUpdates: amlBool('amlTraining', 2),
            usesThirdParties: amlBool('amlTraining', 3),
            authorizedFullname, position, date,
        }, { onSuccess: onNext, onError: (err) => setError(getApiErrorMessage(err)) })
    }

    return (
        <div className="flex flex-col">
            {/* ── Sticky Progress Bar ── */}
            <div className="sticky top-[-25px] z-30 bg-card-bg/95 backdrop-blur-sm -mx-6 px-8 py-6 mb-8 border-b border-border-theme/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[#185fa5] uppercase tracking-widest">Questionnaire Progress</span>
                    <span className="text-xs font-bold text-foreground">{completedSections} of {totalSections} sections completed</span>
                </div>
                <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedSections / totalSections) * 100}%` }}
                        className="h-full bg-[#185fa5] shadow-lg shadow-[#185fa5]/20"
                    />
                </div>
            </div>

            <div className="flex flex-col">
                {/* ── Section 1: General Information ── */}
                <SectionHeader 
                    num={1} title="General information" questionCount={5} 
                    status={getGeneralStatus()} 
                    open={openSection === 'general'} 
                    onClick={() => setOpenSection(openSection === 'general' ? '' : 'general')} 
                />
                <AnimatePresence>
                    {openSection === 'general' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="flex flex-col gap-8 pb-10 pt-2 px-12 border-l-2 border-border-theme ml-4">
                                <div>
                                    <p className="text-sm font-medium text-foreground mb-1">Do you have any PEP UBO (10% or more)? *</p>
                                    <YesNoPills value={hasPepUbo} onChange={setHasPepUbo} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground mb-1">Do you have any PEP board members? *</p>
                                    <YesNoPills value={hasPepDirector} onChange={setHasPepDirector} />
                                </div>
                                {(hasPepUbo === 'yes' || hasPepDirector === 'yes') && (
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 bg-blue-50/30 p-6 rounded-2xl border border-blue-50">
                                        <FieldInput placeholder="Full Name *" value={pepName} onChange={setPepName} />
                                        <FieldInput placeholder="Role/Position *" value={pepRole} onChange={setPepRole} />
                                        <FieldInput placeholder="Relationship *" value={pepRelationship} onChange={setPepRelationship} />
                                        <FieldInput placeholder="Percentage ownership *" value={pepOwnershipPercentage} isNumeric maxLength={3} onChange={setPepOwnershipPercentage} />
                                        <div className="col-span-2">
                                            <FieldSelect placeholder="Country of PEP Association *" value={pepCountry} onChange={setPepCountry} options={COUNTRIES} />
                                        </div>
                                    </div>
                                )}
                                <FieldInput placeholder="Countries of Operation *" value={countriesOfOperation} onChange={setCountriesOfOperation} description="e.g. Nigeria, Ghana, Kenya" />
                                <div className="grid grid-cols-2 gap-8">
                                    <FieldInput placeholder="Number of Locations *" value={numberOfLocations} isNumeric maxLength={5} onChange={setNumberOfLocations} description="e.g. 3" />
                                    <FieldInput placeholder="Years in business *" value={yearsInBusiness} isNumeric maxLength={3} onChange={setYearsInBusiness} description="e.g. 5" />
                                </div>
                                <FieldSelect placeholder="Nature of Business *" value={natureOfBusiness} onChange={setNatureOfBusiness} options={SECTORS} />
                                {natureOfBusiness === 'Others (Specify)' && <FieldInput placeholder="Specify Nature of Business *" value={othersSpecification} onChange={setOthersSpecification} />}
                                <FieldSelect placeholder="Legal Status *" value={legalStatus} onChange={setLegalStatus} options={LEGAL_STATUS_OPTIONS} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="border-t border-border-theme" />

                {/* ── Section 2: Regulatory & Compliance ── */}
                <SectionHeader 
                    num={2} title="Regulatory & compliance information" questionCount={6} 
                    status={getRegStatus()} 
                    open={openSection === 'regulatory'} 
                    onClick={() => setOpenSection(openSection === 'regulatory' ? '' : 'regulatory')} 
                />
                <AnimatePresence>
                    {openSection === 'regulatory' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="flex flex-col gap-8 pb-10 pt-2 px-12 border-l-2 border-border-theme ml-4">
                                <div>
                                    <p className="text-sm font-medium text-foreground mb-1">Does the entity require Central Bank or SEC approval? *</p>
                                    <YesNoPills value={requiresCbApproval} onChange={setRequiresCbApproval} />
                                </div>
                                {requiresCbApproval === 'yes' && (
                                    <div className="flex flex-col gap-6 bg-blue-50/30 p-6 rounded-2xl border border-blue-50">
                                        <FieldInput placeholder="Approval details *" value={cbApprovalDetails} onChange={setCbApprovalDetails} />
                                        <div className="flex flex-col gap-2">
                                            <p className="text-[10px] font-bold text-muted-theme uppercase tracking-widest ml-1">Attach copy of approval document</p>
                                            <FileUploadZone files={files} onChange={setFiles} />
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-foreground mb-1">Is the company subject to financial regulation (AML)? *</p>
                                    <YesNoPills value={subjectToAmlReg} onChange={setSubjectToAmlReg} />
                                </div>
                                {subjectToAmlReg === 'yes' && (
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 bg-blue-50/30 p-6 rounded-2xl border border-blue-50">
                                        <div className="col-span-2">
                                            <FieldInput placeholder="Regulation name *" value={amlRegName} onChange={setAmlRegName} description="e.g. CBN Regulation XYZ" />
                                        </div>
                                        <FieldInput placeholder="Authority *" value={amlRegAuthority} onChange={setAmlRegAuthority} description="e.g. CBN" />
                                        <FieldSelect placeholder="Country *" value={amlRegCountry} onChange={setAmlRegCountry} options={COUNTRIES} />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-foreground mb-1">Are there any legal claims or convictions (last 5 years)? *</p>
                                    <YesNoPills value={hasLegalClaims} onChange={setHasLegalClaims} />
                                </div>
                                {hasLegalClaims === 'yes' && (
                                    <FieldInput placeholder="Provide details (Case, Court, Status) *" value={legalClaimsDetails} onChange={setLegalClaimsDetails} />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-foreground mb-1">Does the company have a written AML policy? *</p>
                                    <YesNoPills value={hasWrittenAmlPolicy} onChange={setHasWrittenAmlPolicy} />
                                </div>
                                <FieldInput placeholder="Name and Address of Auditors *" value={auditorsInfo} onChange={setAuditorsInfo} />
                                <div>
                                    <p className="text-[10px] font-bold text-muted-theme uppercase tracking-widest mb-3">Screening Sanction Lists *</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {SANCTION_LISTS.map(sl => (
                                            <button
                                                key={sl} type="button"
                                                onClick={() => toggleSanctionList(sl)}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                                    sanctionLists.includes(sl) 
                                                        ? 'bg-blue-50 border-[#185fa5] text-[#185fa5]' 
                                                        : 'bg-card-bg border-border-theme text-muted-theme hover:border-border-theme'
                                                }`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${sanctionLists.includes(sl) ? 'bg-[#185fa5] border-[#185fa5]' : 'border-border-theme'}`}>
                                                    {sanctionLists.includes(sl) && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={4} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                                {sl}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {AML_SECTIONS.map((section, idx) => {
                    const status = getAmlSectionStatus(section.key)
                    const num = idx + 3
                    return (
                        <div key={section.key}>
                            <div className="border-t border-border-theme" />
                            <SectionHeader 
                                num={num} title={section.title} questionCount={section.questions.length} 
                                status={status} open={openSection === section.key} 
                                onClick={() => setOpenSection(openSection === section.key ? '' : section.key)} 
                            />
                            <AnimatePresence>
                                {openSection === section.key && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <div className="flex flex-col gap-10 pb-10 pt-2 px-12 border-l-2 border-border-theme ml-4">
                                            {section.questions.map((q, i) => (
                                                <div key={i} className="flex flex-col gap-3">
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-xs font-bold text-gray-300 mt-1">Q{i + 1}.</span>
                                                        <p className="text-sm font-medium text-foreground leading-relaxed">{q.text} *</p>
                                                    </div>
                                                    <div className="ml-7">
                                                        {q.type === 'yesno' ? (
                                                            <YesNoPills value={amlAnswers[section.key][i] as YesNo} onChange={v => setAmlAnswer(section.key, i, v)} />
                                                        ) : (
                                                            <FieldInput placeholder="Enter your response..." value={amlAnswers[section.key][i] as string} onChange={v => setAmlAnswer(section.key, i, v)} />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}

                <div className="border-t border-border-theme" />

                {/* ── Section Final: Authorization ── */}
                <SectionHeader 
                    num={AML_SECTIONS.length + 3} title="Authorization" questionCount={3} 
                    status={authorizedFullname && position && date ? 'Done' : 'Not started'} 
                    open={openSection === 'auth'} 
                    onClick={() => setOpenSection(openSection === 'auth' ? '' : 'auth')} 
                />
                <AnimatePresence>
                    {openSection === 'auth' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                            <div className="flex flex-col gap-8 pb-12 pt-2 px-12 border-l-2 border-border-theme ml-4">
                                <div className="bg-blue-50/20 p-8 rounded-[24px] border border-blue-50/50">
                                    <div className="flex flex-col gap-6">
                                        <input
                                            type="text" value={authorizedFullname} onChange={e => setAuthorizedFullname(e.target.value)}
                                            placeholder="Type your full name here as signature *"
                                            className={`w-full pb-4 placeholder-gray-300 outline-none border-b border-border-theme focus:border-[#185fa5] bg-transparent transition-all text-foreground ${signatureFont.className}`}
                                            style={{ fontSize: '2rem', lineHeight: '1.2' }}
                                        />
                                        <div className="grid grid-cols-2 gap-8 mt-4">
                                            <FieldInput placeholder="Position / Title *" value={position} onChange={setPosition} />
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] text-muted-theme uppercase font-bold ml-1">Signature Date *</label>
                                                <DatePicker value={date} onChange={setDate} placeholder="Select Date" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {error && <p className="text-xs text-red-500 mt-6 font-bold uppercase tracking-wide text-center">{error}</p>}

            <div className="flex justify-end mt-12 pt-8 border-t border-border-theme">
                <button
                    onClick={handleNext}
                    disabled={isPending || !isFormValid}
                    className={`flex items-center gap-3 px-10 py-3.5 rounded-xl text-sm font-bold transition-all uppercase tracking-widest ${
                        isFormValid 
                            ? 'bg-[#185fa5] text-white shadow-xl shadow-[#185fa5]/20 hover:scale-[1.02] active:scale-[0.98]' 
                            : 'bg-surface-hover text-muted-theme cursor-not-allowed'
                    }`}
                >
                    {isPending ? 'Saving Questionnaire...' : 'Submit & Continue'}
                    {!isPending && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    )
}
