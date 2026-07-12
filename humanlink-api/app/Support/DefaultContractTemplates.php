<?php

declare(strict_types=1);

namespace App\Support;

final class DefaultContractTemplates
{
    /**
     * @return list<array{name: string, employment_type: string, body: string, is_active: bool}>
     */
    public static function all(): array
    {
        return [
            [
                'name' => 'Regular Employment Contract',
                'employment_type' => 'regular',
                'body' => self::regularBody(),
                'is_active' => true,
            ],
            [
                'name' => 'Probationary Employment Contract',
                'employment_type' => 'probationary',
                'body' => self::probationaryBody(),
                'is_active' => true,
            ],
            [
                'name' => 'Contractor Agreement',
                'employment_type' => 'contractor',
                'body' => self::contractorBody(),
                'is_active' => true,
            ],
        ];
    }

    private static function header(string $title): string
    {
        return <<<HTML
<table class="brand-bar">
    <tr>
        <td>
            <div class="brand-name">{{company_name}}</div>
            <div class="brand-tag">People operations · Employment records</div>
        </td>
        <td class="doc-meta">
            Document date
            <strong>{{generated_at}}</strong>
        </td>
    </tr>
</table>
<div class="doc-title">{$title}</div>
HTML;
    }

    private static function partiesPanel(string $intro): string
    {
        return <<<HTML
<p class="doc-intro">{$intro}</p>
<table class="panel">
    <tr>
        <th>Full name</th>
        <th>Email</th>
    </tr>
    <tr>
        <td>{{employee_name}}</td>
        <td>{{email}}</td>
    </tr>
    <tr>
        <th>Job title</th>
        <th>Department</th>
    </tr>
    <tr>
        <td>{{job_title}}</td>
        <td>{{department}}</td>
    </tr>
    <tr>
        <th>Employment type</th>
        <th>Start / hire date</th>
    </tr>
    <tr>
        <td>{{employment_type}}</td>
        <td>{{hired_at}}</td>
    </tr>
</table>
HTML;
    }

    private static function section(string $number, string $title, string $content): string
    {
        return <<<HTML
<div class="section">
    <table class="section-head">
        <tr>
            <td class="section-num">{$number}</td>
            <td class="section-title">{$title}</td>
        </tr>
    </table>
    {$content}
</div>
HTML;
    }

    private static function compensationContent(): string
    {
        return <<<'HTML'
<p>
    The Company shall pay the following compensation, subject to lawful deductions and applicable tax rules.
    Pay is released according to the Company payroll schedule. Allowances, bonuses, or incentives are
    discretionary unless stated in a separate written policy or addendum.
</p>
<table class="rates">
    <tr>
        <th>Compensation item</th>
        <th>Amount</th>
    </tr>
    <tr>
        <td>Monthly rate</td>
        <td class="amount">{{monthly_rate}}</td>
    </tr>
    <tr>
        <td>Daily rate</td>
        <td class="amount">{{daily_rate}}</td>
    </tr>
    <tr>
        <td>Hourly rate</td>
        <td class="amount">{{hourly_rate}}</td>
    </tr>
</table>
HTML;
    }

    private static function signatureBlock(string $partyLabel): string
    {
        return <<<HTML
<table class="sign-table">
    <tr>
        <td>
            <div class="sign-label">{$partyLabel}</div>
            <div class="sign-line">Signature &nbsp;&nbsp;&nbsp; Date</div>
            <div style="margin-top:10px;font-size:10px;color:#64748b;">Printed name: {{employee_name}}</div>
        </td>
        <td>
            <div class="sign-label">Authorized company representative</div>
            <div class="sign-line">Signature &nbsp;&nbsp;&nbsp; Date</div>
            <div style="margin-top:10px;font-size:10px;color:#64748b;">Name / title</div>
        </td>
    </tr>
</table>
<div class="footer-note">
    Generated for {{company_name}} · Retain the signed copy as the official employment record.
</div>
HTML;
    }

    private static function regularBody(): string
    {
        $header = self::header('Regular Employment Agreement');
        $parties = self::partiesPanel(
            'This Agreement is entered into by and between the Company and the Employee named below.'
        );
        $s1 = self::section('01', 'Position and duties', <<<'HTML'
<p>
    The Employee is engaged as <strong>{{job_title}}</strong> in the <strong>{{department}}</strong> department
    on a regular (permanent) employment basis, effective <strong>{{hired_at}}</strong>.
</p>
<p>
    The Employee shall perform the duties reasonably associated with the role, follow lawful instructions
    of supervisors, and comply with Company policies, the Code of Conduct, attendance rules, and data
    protection requirements as updated from time to time.
</p>
HTML);
        $s2 = self::section('02', 'Compensation', self::compensationContent());
        $s3 = self::section('03', 'Working hours and attendance', <<<'HTML'
<p>
    Working hours, rest days, and overtime rules follow the Employee’s approved work schedule and applicable law.
    The Employee shall record time accurately using the Company’s attendance system.
</p>
HTML);
        $s4 = self::section('04', 'Benefits and leave', <<<'HTML'
<p>
    The Employee is entitled to statutory benefits and leave credits under Company leave policies and applicable law.
    Details of leave types and balances are maintained in the HR system.
</p>
HTML);
        $s5 = self::section('05', 'Confidentiality and intellectual property', <<<'HTML'
<p>
    The Employee shall keep confidential all proprietary, client, and employee information obtained in the course
    of employment, and shall not disclose it without prior written authorization, except as required by law.
    Work product created within the scope of employment belongs to the Company.
</p>
HTML);
        $s6 = self::section('06', 'Conflict of interest', <<<'HTML'
<p>
    The Employee shall avoid conflicts of interest and shall not engage in outside work that interferes with
    Company duties or competes with the Company without prior written approval.
</p>
HTML);
        $s7 = self::section('07', 'Termination', <<<'HTML'
<p>
    Employment may end by resignation, mutual agreement, or for just or authorized causes under applicable labor law
    and Company policy, subject to required notices and clearances. Upon separation, the Employee shall return all
    Company property and complete offboarding requirements.
</p>
HTML);
        $s8 = self::section('08', 'Entire agreement', <<<'HTML'
<p>
    This Agreement, together with Company policies and any written addenda, constitutes the employment terms for
    the role described above. Changes must be in writing and approved by an authorized Company representative.
</p>
HTML);
        $signatures = self::section('09', 'Signatures', self::signatureBlock('Employee'));

        return $header.$parties.$s1.$s2.$s3.$s4.$s5.$s6.$s7.$s8.$signatures;
    }

    private static function probationaryBody(): string
    {
        $header = self::header('Probationary Employment Agreement');
        $parties = self::partiesPanel(
            'This Agreement covers probationary employment between the Company and the Employee named below.'
        );
        $s1 = self::section('01', 'Position and probation', <<<'HTML'
<p>
    The Employee is engaged as <strong>{{job_title}}</strong> in the <strong>{{department}}</strong> department
    on a <strong>probationary</strong> basis, effective <strong>{{hired_at}}</strong>.
</p>
<p>
    The probationary period evaluates fitness for regularization based on performance, conduct, attendance,
    and alignment with Company standards. Regularization is not automatic and depends on satisfactory results
    and business needs. The Company will communicate the outcome in writing.
</p>
HTML);
        $s2 = self::section('02', 'Compensation', self::compensationContent());
        $s3 = self::section('03', 'Working hours and attendance', <<<'HTML'
<p>
    Working hours and rest days follow the approved schedule. Accurate timekeeping is required. Excessive tardiness,
    absences without notice, or policy violations may affect regularization and may be grounds for separation
    subject to due process.
</p>
HTML);
        $s4 = self::section('04', 'Benefits and leave', <<<'HTML'
<p>
    Statutory benefits apply as required by law. Company leave and other discretionary benefits during probation
    follow published HR policies.
</p>
HTML);
        $s5 = self::section('05', 'Confidentiality and intellectual property', <<<'HTML'
<p>
    Confidential information and work product created in the course of employment remain protected and belong to
    the Company, including after the probationary period ends.
</p>
HTML);
        $s6 = self::section('06', 'Termination during probation', <<<'HTML'
<p>
    Either party may end employment during probation in accordance with applicable labor standards, Company policy,
    and required notices. The Employee shall return Company property and complete clearance upon separation.
</p>
HTML);
        $s7 = self::section('07', 'Entire agreement', <<<'HTML'
<p>
    This Agreement and Company policies set out the probationary employment terms. Amendments must be in writing.
</p>
HTML);
        $signatures = self::section('08', 'Signatures', self::signatureBlock('Employee'));

        return $header.$parties.$s1.$s2.$s3.$s4.$s5.$s6.$s7.$signatures;
    }

    private static function contractorBody(): string
    {
        $header = self::header('Independent Contractor Agreement');
        $parties = self::partiesPanel(
            'This Agreement engages the Contractor named below as an independent service provider to the Company.'
        );
        $s1 = self::section('01', 'Engagement', <<<'HTML'
<p>
    The Company engages <strong>{{employee_name}}</strong> as an independent contractor to provide services in the
    capacity of <strong>{{job_title}}</strong> (Department: <strong>{{department}}</strong>), commencing
    <strong>{{hired_at}}</strong>.
</p>
<p>
    Nothing in this Agreement creates an employer–employee relationship, partnership, or joint venture.
    The Contractor is responsible for their own taxes, licenses, and statutory contributions unless a written
    addendum states otherwise.
</p>
HTML);
        $s2 = self::section('02', 'Scope of services', <<<'HTML'
<p>
    The Contractor shall perform the agreed services with professional care, meet agreed timelines, and follow
    lawful instructions related to deliverables. Specific deliverables may be defined in statements of work,
    tickets, or project briefs issued by the Company.
</p>
HTML);
        $s3 = self::section('03', 'Fees', self::compensationContent());
        $s4 = self::section('04', 'Tools, expenses, and access', <<<'HTML'
<p>
    Unless otherwise agreed in writing, the Contractor provides their own tools. Company systems, credentials, and
    materials remain Company property and must be used only for authorized work.
</p>
HTML);
        $s5 = self::section('05', 'Confidentiality and data protection', <<<'HTML'
<p>
    The Contractor shall protect confidential and personal data accessed during the engagement and shall not
    disclose it to third parties without written consent, except as required by law. Obligations survive the end
    of this Agreement.
</p>
HTML);
        $s6 = self::section('06', 'Intellectual property', <<<'HTML'
<p>
    All work product, code, designs, documents, and materials created for the Company under this Agreement are
    assigned to the Company upon creation, unless a written exception is signed by both parties.
</p>
HTML);
        $s7 = self::section('07', 'Term and termination', <<<'HTML'
<p>
    This Agreement begins on <strong>{{hired_at}}</strong> and continues until completed, expired, or terminated.
    Either party may terminate upon reasonable written notice, or immediately for material breach, confidentiality
    violations, or unlawful conduct. Upon ending the engagement, the Contractor shall return Company property and
    submit final invoices for approved work.
</p>
HTML);
        $s8 = self::section('08', 'Entire agreement', <<<'HTML'
<p>
    This Agreement, together with any statements of work and Company contractor policies, forms the complete
    understanding of the parties. Changes must be in writing.
</p>
HTML);
        $signatures = self::section('09', 'Signatures', self::signatureBlock('Contractor'));

        return $header.$parties.$s1.$s2.$s3.$s4.$s5.$s6.$s7.$s8.$signatures;
    }
}
