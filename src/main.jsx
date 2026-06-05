import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const partners = [
  { name: "USAID GHSC-PSM", type: "Bilateral", support: ["Financial", "Technical", "Training"], modules: ["Requisitions", "Order approval", "Analytics"], role: "Requisition approver", provinces: ["Lusaka", "Copperbelt", "Southern", "Eastern"], products: ["HIV", "Malaria", "Essential medicines"], committed: 5200000, disbursed: 4100000, compliance: 91, facilities: 462, status: "Active", endDate: "2026-09-30", focal: "MoH LMU / USAID", contact: "moh-lmu@example.gov.zm", phone: "+260 000 000 001", lastActivity: "2026-05-24" },
  { name: "Global Fund", type: "Multilateral", support: ["Financial", "Governance"], modules: ["Analytics", "Reporting", "Master data"], role: "Data viewer", provinces: ["Lusaka", "Copperbelt", "North-Western", "Western"], products: ["HIV", "TB", "Malaria"], committed: 4800000, disbursed: 3500000, compliance: 87, facilities: 388, status: "Active", endDate: "2027-03-31", focal: "MoH Grants Unit", contact: "grants@example.gov.zm", phone: "+260 000 000 002", lastActivity: "2026-05-18" },
  { name: "UNICEF", type: "Multilateral", support: ["Technical", "Training", "Commodities"], modules: ["Inventory", "Reporting", "Facility support"], role: "Trainer", provinces: ["Luapula", "Northern", "Muchinga", "Eastern"], products: ["Vaccines", "Nutrition", "Child health"], committed: 2100000, disbursed: 1600000, compliance: 94, facilities: 274, status: "Active", endDate: "2026-12-15", focal: "EPI Programme", contact: "epi@example.gov.zm", phone: "+260 000 000 003", lastActivity: "2026-05-27" },
  { name: "CHAI", type: "NGO", support: ["Technical", "Analytics"], modules: ["Analytics", "Interoperability", "Dashboards"], role: "System admin", provinces: ["Lusaka", "Central", "Southern"], products: ["HIV", "Maternal health"], committed: 1250000, disbursed: 1010000, compliance: 82, facilities: 195, status: "Active", endDate: "2026-08-20", focal: "Digital Health Unit", contact: "digitalhealth@example.gov.zm", phone: "+260 000 000 004", lastActivity: "2026-05-14" },
  { name: "JICA", type: "Bilateral", support: ["Infrastructure", "Training"], modules: ["Warehouse", "Order approval", "Inventory"], role: "Warehouse mentor", provinces: ["Lusaka", "Copperbelt"], products: ["Essential medicines", "Lab commodities"], committed: 1850000, disbursed: 910000, compliance: 73, facilities: 88, status: "At-risk", endDate: "2026-07-31", focal: "ZAMMSA Operations", contact: "operations@example.gov.zm", phone: "+260 000 000 005", lastActivity: "2026-04-29" },
  { name: "World Bank", type: "Multilateral", support: ["Financial", "Governance"], modules: ["Master data", "Reporting"], role: "Accountable owner", provinces: ["National"], products: ["All programmes"], committed: 3300000, disbursed: 2500000, compliance: 89, facilities: 0, status: "Active", endDate: "2027-06-30", focal: "MoH Planning", contact: "planning@example.gov.zm", phone: "+260 000 000 006", lastActivity: "2026-05-21" },
  { name: "Crown Agents", type: "Private", support: ["Technical", "Infrastructure"], modules: ["Warehouse", "Integration support"], role: "Consulted specialist", provinces: ["Lusaka", "Central"], products: ["Procurement", "Warehousing"], committed: 760000, disbursed: 760000, compliance: 97, facilities: 42, status: "Completed", endDate: "2026-05-31", focal: "ZAMMSA ICT", contact: "ict@example.gov.zm", phone: "+260 000 000 007", lastActivity: "2026-05-30" },
  { name: "PATH", type: "NGO", support: ["Training", "Analytics"], modules: ["Facility support", "Reporting"], role: "Trainer", provinces: ["Western", "Southern", "Eastern"], products: ["Vaccines", "Malaria"], committed: 940000, disbursed: 510000, compliance: 78, facilities: 214, status: "Planned", endDate: "2027-01-15", focal: "EPI Programme", contact: "epi-path@example.gov.zm", phone: "+260 000 000 008", lastActivity: "2026-05-03" }
];

const provinces = ["Central", "Copperbelt", "Eastern", "Luapula", "Lusaka", "Muchinga", "Northern", "North-Western", "Southern", "Western"];
const provinceMarkerPositions = {
  Central: { top: "48%", left: "52%" },
  Copperbelt: { top: "34%", left: "45%" },
  Eastern: { top: "53%", left: "72%" },
  Luapula: { top: "26%", left: "59%" },
  Lusaka: { top: "64%", left: "56%" },
  Muchinga: { top: "32%", left: "68%" },
  Northern: { top: "18%", left: "57%" },
  "North-Western": { top: "30%", left: "28%" },
  Southern: { top: "76%", left: "44%" },
  Western: { top: "65%", left: "23%" }
};
const supportFilters = ["All", "Financial", "Technical", "Training", "Commodities", "Infrastructure", "Governance", "Analytics"];
const partnerTypeFilters = ["All", "Bilateral", "Multilateral", "NGO", "Private"];
const moduleRows = ["Requisitions", "Order approval", "Inventory", "Reporting", "Analytics", "Warehouse", "Master data", "Interoperability", "Facility support"];
const roleFilters = ["All", "Requisition approver", "Data viewer", "Trainer", "System admin", "Warehouse mentor", "Accountable owner", "Consulted specialist"];
const dataUpdatedAt = "2026-06-05";
const refreshSchedule = "Weekly every Monday 08:00 CAT";
const dataSources = ["Partner reports", "DHIS2 org units", "ZAMMSA WHXpert", "eLMIS requisition metadata", "MoH grant records"];
const pages = [
  ["overview", "Overview"],
  ["roadmap", "Roadmap"],
  ["partners", "Partners"],
  ["mapping", "Mapping"],
  ["modules", "eLMIS roles"],
  ["funding", "Funding"],
  ["performance", "Performance"],
  ["interoperability", "Interoperability"],
  ["contacts", "Contacts"]
];

function money(value) {
  return `$${(value / 1000000).toFixed(value >= 1000000 ? 1 : 2)}M`;
}

function daysTo(dateString) {
  const today = new Date("2026-06-05T00:00:00");
  const end = new Date(`${dateString}T00:00:00`);
  return Math.ceil((end - today) / 86400000);
}

function downloadCsv(rows) {
  const headers = ["Partner", "Type", "Status", "Support", "Modules", "Role", "Provinces", "Products", "Committed", "Disbursed", "Compliance", "Facilities", "End Date", "Focal Person", "Last Activity"];
  const csvRows = rows.map((p) => [
    p.name, p.type, p.status, p.support.join("; "), p.modules.join("; "), p.role, p.provinces.join("; "), p.products.join("; "),
    p.committed, p.disbursed, p.compliance, p.facilities, p.endDate, p.focal, p.lastActivity
  ]);
  const csv = [headers, ...csvRows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "elmis-partner-mapping-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function downloadExcel(rows) {
  const headers = ["Partner", "Type", "Status", "Support", "Modules", "Role", "Provinces", "Products", "Committed", "Disbursed", "Compliance", "Facilities", "End Date", "Renewal Alert", "Focal Person", "Last Activity"];
  const tableRows = rows.map((p) => [p.name, p.type, p.status, p.support.join("; "), p.modules.join("; "), p.role, p.provinces.join("; "), p.products.join("; "), p.committed, p.disbursed, `${p.compliance}%`, p.facilities, p.endDate, renewalLevel(p).label, p.focal, p.lastActivity]);
  const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${tableRows.map((row) => `<tr>${row.map((cell) => `<td>${String(cell).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
  downloadBlob(html, "elmis-partner-mapping-report.xls", "application/vnd.ms-excel;charset=utf-8");
}

function downloadJson(rows) {
  const payload = {
    schema: "moh-elmis-partner-mapping/v1",
    lastUpdated: dataUpdatedAt,
    refreshSchedule,
    interoperability: ["DHIS2", "ZAMMSA WHXpert", "eLMIS", "LMIS partner registry"],
    partners: rows
  };
  downloadBlob(JSON.stringify(payload, null, 2), "elmis-partner-mapping-api.json", "application/json;charset=utf-8");
}

function downloadBlob(content, fileName, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [page, setPage] = useState("overview");
  const [supportFilter, setSupportFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [provinceFilter, setProvinceFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [query, setQuery] = useState("");

  const visiblePartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesSupport = supportFilter === "All" || partner.support.includes(supportFilter);
      const matchesStatus = statusFilter === "All" || partner.status === statusFilter;
      const matchesType = typeFilter === "All" || partner.type === typeFilter;
      const matchesProvince = provinceFilter === "All" || partner.provinces.includes(provinceFilter) || partner.provinces.includes("National");
      const matchesRole = roleFilter === "All" || partner.role === roleFilter;
      const haystack = [partner.name, partner.type, partner.role, partner.focal, partner.contact, ...partner.modules, ...partner.provinces, ...partner.products].join(" ").toLowerCase();
      return matchesSupport && matchesStatus && matchesType && matchesProvince && matchesRole && haystack.includes(query.toLowerCase());
    });
  }, [supportFilter, statusFilter, typeFilter, provinceFilter, roleFilter, query]);

  const totals = useMemo(() => {
    const committed = visiblePartners.reduce((sum, p) => sum + p.committed, 0);
    const disbursed = visiblePartners.reduce((sum, p) => sum + p.disbursed, 0);
    const facilities = visiblePartners.reduce((sum, p) => sum + p.facilities, 0);
    const expiring = visiblePartners.filter((p) => daysTo(p.endDate) <= 120).length;
    const compliance = Math.round(visiblePartners.reduce((sum, p) => sum + p.compliance, 0) / visiblePartners.length || 0);
    return { committed, disbursed, facilities, expiring, compliance };
  }, [visiblePartners]);

  function showExpiringSoon() {
    setStatusFilter("All");
    setSupportFilter("All");
    setTypeFilter("All");
    setProvinceFilter("All");
    setRoleFilter("All");
    setQuery("");
    setPage("performance");
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Ministry of Health Zambia</p>
          <h1>eLMIS Partner Mapping Dashboard</h1>
          <p className="subtitle">Operational view of partner coverage, eLMIS roles, funding execution, performance, contacts, and expiring agreements.</p>
        </div>
        <div className="actions">
          <button type="button" onClick={() => downloadCsv(visiblePartners)}>Export CSV</button>
          <button type="button" onClick={() => downloadExcel(visiblePartners)}>Export Excel</button>
          <button type="button" className="alert-button" onClick={showExpiringSoon}>{totals.expiring} expiring soon</button>
        </div>
      </header>

      <section className="freshness-band" aria-label="Data freshness and interoperability">
        <span>Last updated: {dataUpdatedAt}</span>
        <span>Refresh schedule: {refreshSchedule}</span>
        <span>Sources: {dataSources.slice(0, 3).join(", ")}</span>
        <button type="button" onClick={() => downloadJson(visiblePartners)}>Download API JSON</button>
      </section>

      <nav className="page-nav" aria-label="Dashboard pages">
        {pages.map(([id, label]) => (
          <button type="button" key={id} className={page === id ? "active" : ""} onClick={() => setPage(id)}>{label}</button>
        ))}
      </nav>

      <Filters
        query={query}
        setQuery={setQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        provinceFilter={provinceFilter}
        setProvinceFilter={setProvinceFilter}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        supportFilter={supportFilter}
        setSupportFilter={setSupportFilter}
      />

      <section className="kpi-grid" aria-label="Summary KPIs">
        <Kpi label="Mapped partners" value={visiblePartners.length} detail={`${visiblePartners.filter((p) => p.status === "Active").length} active`} />
        <Kpi label="Committed funding" value={money(totals.committed)} detail={`${money(totals.disbursed)} disbursed`} />
        <Kpi label="Funding disbursed" value={`${Math.round((totals.disbursed / totals.committed) * 100 || 0)}%`} detail="Execution rate" />
        <Kpi label="Facilities assigned" value={totals.facilities.toLocaleString()} detail="Excludes national-only support" />
        <Kpi label="Partners at-risk" value={visiblePartners.filter((p) => p.status === "At-risk" || p.compliance < 80 || daysTo(p.endDate) <= 120).length} detail={`${totals.compliance}% avg compliance`} />
      </section>

      {page === "overview" && <Overview partners={visiblePartners} setProvinceFilter={setProvinceFilter} />}
      {page === "roadmap" && <RoadmapPage />}
      {page === "partners" && <PartnersPage partners={visiblePartners} />}
      {page === "mapping" && <MappingPage partners={visiblePartners} setProvinceFilter={setProvinceFilter} />}
      {page === "modules" && <ModulesPage partners={visiblePartners} />}
      {page === "funding" && <FundingPage partners={visiblePartners} />}
      {page === "performance" && <PerformancePage partners={visiblePartners} />}
      {page === "interoperability" && <InteroperabilityPage partners={visiblePartners} />}
      {page === "contacts" && <ContactsPage partners={visiblePartners} />}
    </main>
  );
}

function Filters({ query, setQuery, statusFilter, setStatusFilter, typeFilter, setTypeFilter, provinceFilter, setProvinceFilter, roleFilter, setRoleFilter, supportFilter, setSupportFilter }) {
  return (
    <section className="filter-band" aria-label="Dashboard filters">
      <label>
        <span>Search</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Partner, province, module, focal person" />
      </label>
      <label>
        <span>Status</span>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          {["All", "Active", "Planned", "At-risk", "Completed"].map((status) => <option key={status}>{status}</option>)}
        </select>
      </label>
      <label>
        <span>Partner type</span>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
          {partnerTypeFilters.map((type) => <option key={type}>{type}</option>)}
        </select>
      </label>
      <label>
        <span>Province</span>
        <select value={provinceFilter} onChange={(event) => setProvinceFilter(event.target.value)}>
          {["All", "National", ...provinces].map((province) => <option key={province}>{province}</option>)}
        </select>
      </label>
      <label>
        <span>eLMIS role</span>
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
          {roleFilters.map((role) => <option key={role}>{role}</option>)}
        </select>
      </label>
      <div className="segmented" role="group" aria-label="Support type">
        {supportFilters.map((filter) => (
          <button type="button" key={filter} className={filter === supportFilter ? "selected" : ""} onClick={() => setSupportFilter(filter)}>
            {filter}
          </button>
        ))}
      </div>
    </section>
  );
}

function Overview({ partners, setProvinceFilter }) {
  return (
    <>
      <section className="layout-grid">
        <MapPanel partners={partners} setProvinceFilter={setProvinceFilter} />
        <SupportBreakdown partners={partners} />
      </section>
      <section className="layout-grid wide-left">
        <ModuleMatrix partners={partners} />
        <RiskPanel partners={partners} />
      </section>
      <DirectoryTable partners={partners} title="Partner directory" />
    </>
  );
}

function RoadmapPage() {
  const rows = [
    ["Strategic KPIs", "Implemented", "Automated totals for active partners, funding, disbursement rate, facilities, and risk count."],
    ["Data Visualization", "Implemented", "Province density map, support mix donut, funding bars, and compliance trend chart."],
    ["User Interaction", "Implemented", "Linked search and filters for status, province, partner type, support type, and eLMIS role."],
    ["Data Reliability", "Implemented", "Data as-of date, refresh schedule, and source system strip are visible above filters."],
    ["System Interoperability", "In progress", "JSON export contract is available; DHIS2, WHXpert, eLMIS, and partner M&E API hooks are documented."],
    ["Advanced Analytics", "Implemented", "Compliance trend and automated alert flags classify partners as On Track, Needs Attention, or At Risk."]
  ];
  return (
    <section className="layout-grid wide-left">
      <div className="panel">
        <PanelTitle eyebrow="Upgrade roadmap" title="Implementation status" />
        <CompactTable headers={["Improvement area", "Status", "Dashboard response"]} rows={rows} />
      </div>
      <div className="panel">
        <PanelTitle eyebrow="Data sources" title="Current and planned source systems" />
        <div className="source-grid">
          {dataSources.map((source) => <span key={source}>{source}</span>)}
        </div>
      </div>
    </section>
  );
}

function SupportBreakdown({ partners }) {
  const rows = supportFilters
    .filter((item) => item !== "All")
    .map((support) => ({ support, count: partners.filter((p) => p.support.includes(support)).length }))
    .filter((item) => item.count > 0);
  const total = rows.reduce((sum, item) => sum + item.count, 0) || 1;
  const colors = ["#256F52", "#7A9F35", "#D19A25", "#4D7EA8", "#8A5C9E", "#C05B46", "#5A776E"];
  const gradient = rows.reduce((parts, item, index) => {
    const previous = rows.slice(0, index).reduce((sum, row) => sum + row.count, 0);
    const start = (previous / total) * 100;
    const end = ((previous + item.count) / total) * 100;
    return [...parts, `${colors[index % colors.length]} ${start}% ${end}%`];
  }, []).join(", ");
  return (
    <div className="panel">
      <PanelTitle eyebrow="Support mix" title="Support type breakdown" />
      <div className="donut-layout">
        <div className="donut" style={{ background: `conic-gradient(${gradient})` }}>
          <span>{total}</span>
        </div>
        <div className="legend-list">
          {rows.map((item, index) => (
            <div className="legend-row" key={item.support}>
              <i style={{ background: colors[index % colors.length] }} />
              <span>{item.support}</span>
              <strong>{Math.round((item.count / total) * 100)}%</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PartnersPage({ partners }) {
  const byType = ["Bilateral", "Multilateral", "NGO", "Private"].map((type) => ({ type, count: partners.filter((p) => p.type === type).length }));
  return (
    <section className="layout-grid wide-left">
      <DirectoryTable partners={partners} title="Partner registry" />
      <div className="panel">
        <PanelTitle eyebrow="Partner mix" title="Partner count by type" />
        <div className="stat-list">{byType.map((item) => <StatRow key={item.type} label={item.type} value={item.count} />)}</div>
      </div>
    </section>
  );
}

function MappingPage({ partners, setProvinceFilter }) {
  return (
    <section className="layout-grid wide-left">
      <MapPanel partners={partners} setProvinceFilter={setProvinceFilter} />
      <div className="panel">
        <PanelTitle eyebrow="Province detail" title="Coverage by province" />
        <div className="stat-list">
          {provinceCoverage(partners).map(({ province, count, facilities }) => <StatRow key={province} label={province} value={`${count} partners`} detail={`${facilities} facilities`} />)}
        </div>
      </div>
    </section>
  );
}

function ModulesPage({ partners }) {
  return (
    <section className="layout-grid wide-left">
      <ModuleMatrix partners={partners} />
      <div className="panel">
        <PanelTitle eyebrow="Coverage gaps" title="Modules needing ownership" />
        <div className="risk-list">
          {moduleRows.map((module) => ({ module, owners: partners.filter((p) => p.modules.includes(module)) }))
            .filter(({ owners }) => owners.length === 0)
            .map(({ module }) => <div className="risk-item" key={module}><strong>{module}</strong><b className="risk-high">Gap</b></div>)}
          {moduleRows.every((module) => partners.some((p) => p.modules.includes(module))) && <p className="empty-note">All core eLMIS modules have at least one mapped partner.</p>}
        </div>
      </div>
    </section>
  );
}

function FundingPage({ partners }) {
  return (
    <section className="layout-grid wide-left">
      <FundingBars partners={partners} />
      <div className="panel">
        <PanelTitle eyebrow="Agreement tracking" title="Funding execution table" />
        <CompactTable
          headers={["Partner", "Committed", "Disbursed", "Rate", "End date"]}
          rows={partners.map((p) => [p.name, money(p.committed), money(p.disbursed), `${Math.round((p.disbursed / p.committed) * 100)}%`, p.endDate])}
        />
      </div>
    </section>
  );
}

function PerformancePage({ partners }) {
  const watchList = partners.filter((p) => daysTo(p.endDate) <= 180 || p.compliance < 80 || p.status === "At-risk");
  return (
    <section className="layout-grid wide-left">
      <div className="panel">
        <PanelTitle eyebrow="Performance" title="Compliance and last activity" />
        <ComplianceTrend partners={partners} />
        <CompactTable
          headers={["Partner", "Compliance", "Alert flag", "Status", "Last activity", "Days to end"]}
          rows={partners.map((p) => [p.name, `${p.compliance}%`, alertFlag(p).label, p.status, p.lastActivity, daysTo(p.endDate)])}
        />
      </div>
      <RiskPanel partners={watchList.length ? watchList : partners} />
    </section>
  );
}

function InteroperabilityPage({ partners }) {
  const endpoints = [
    ["DHIS2", "Partner activity and reporting org-unit mapping", "Ready for API mapping"],
    ["ZAMMSA WHXpert", "Warehouse, commodity, and order workflow context", "Planned integration"],
    ["eLMIS", "Requisition, approval, inventory, and facility assignment metadata", "Primary source"],
    ["Partner Registry JSON", "Machine-readable export for external systems", "Available now"]
  ];
  return (
    <section className="layout-grid wide-left">
      <div className="panel">
        <PanelTitle eyebrow="Interoperability" title="System integration readiness" />
        <CompactTable headers={["System", "Purpose", "Status"]} rows={endpoints} />
      </div>
      <div className="panel">
        <PanelTitle eyebrow="Machine-readable data" title="Export contract" />
        <div className="api-card">
          <code>schema: moh-elmis-partner-mapping/v1</code>
          <code>records: {partners.length} partners</code>
          <code>updated: {dataUpdatedAt}</code>
          <code>sources: {dataSources.join(" | ")}</code>
          <button type="button" onClick={() => downloadJson(partners)}>Download JSON</button>
        </div>
      </div>
    </section>
  );
}

function ComplianceTrend({ partners }) {
  const points = ["Feb", "Mar", "Apr", "May", "Jun"].map((month, index) => {
    const baseline = Math.round(partners.reduce((sum, p) => sum + p.compliance, 0) / partners.length || 0);
    return { month, value: Math.max(0, Math.min(100, baseline - 5 + index * 2)) };
  });
  const polyline = points.map((point, index) => `${30 + index * 72},${118 - point.value}`).join(" ");
  return (
    <div className="trend-card">
      <svg viewBox="0 0 340 140" role="img" aria-label="Compliance trend chart">
        <line x1="24" y1="18" x2="24" y2="118" />
        <line x1="24" y1="118" x2="324" y2="118" />
        <polyline points={polyline} />
        {points.map((point, index) => <circle key={point.month} cx={30 + index * 72} cy={118 - point.value} r="4" />)}
      </svg>
      <div className="trend-labels">{points.map((point) => <span key={point.month}>{point.month}<b>{point.value}%</b></span>)}</div>
    </div>
  );
}

function ContactsPage({ partners }) {
  return (
    <section className="panel directory-panel">
      <PanelTitle eyebrow="Operational contacts" title="Focal persons and follow-up details" />
      <CompactTable
        headers={["Partner", "Focal person / unit", "Email", "Phone", "Role", "Last activity"]}
        rows={partners.map((p) => [p.name, p.focal, p.contact, p.phone, p.role, p.lastActivity])}
      />
    </section>
  );
}

function MapPanel({ partners, setProvinceFilter }) {
  return (
    <div className="panel map-panel">
      <PanelTitle eyebrow="Geographic mapping" title="Google map of Zambia partner coverage" aside="Select a marker to filter" />
      <div className="google-map-shell">
        <iframe
          title="Google map of Zambia"
          src="https://www.google.com/maps?q=Zambia&z=6&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        {provinceCoverage(partners).map(({ province, count }) => (
          <button
            type="button"
            className={`map-marker level-${Math.min(count, 5)} ${province.toLowerCase().replaceAll(" ", "-")}`}
            key={province}
            style={provinceMarkerPositions[province]}
            onClick={() => setProvinceFilter?.(province)}
            title={`Filter to ${province}`}
          >
            <span>{province}</span>
            <strong>{count}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

function provinceCoverage(rows) {
  return provinces.map((province) => {
    const covering = rows.filter((p) => p.provinces.includes(province) || p.provinces.includes("National"));
    return { province, count: covering.length, facilities: covering.reduce((sum, p) => sum + p.facilities, 0) };
  });
}

function FundingBars({ partners }) {
  return (
    <div className="panel">
      <PanelTitle eyebrow="Funding execution" title="Committed vs disbursed" />
      <div className="funding-bars">
        {partners.map((partner) => (
          <div className="funding-row" key={partner.name}>
            <div className="funding-label"><span>{partner.name}</span><strong>{money(partner.committed)}</strong></div>
            <div className="bar-track">
              <span className="bar-committed" style={{ width: "100%" }} />
              <span className="bar-disbursed" style={{ width: `${Math.round((partner.disbursed / partner.committed) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModuleMatrix({ partners }) {
  return (
    <div className="panel">
      <PanelTitle eyebrow="Functional mapping" title="eLMIS module and RACI view" />
      <div className="module-matrix">
        <div className="matrix-header">Module</div>
        <div className="matrix-header">Partners</div>
        <div className="matrix-header">Primary role</div>
        {moduleRows.map((module) => {
          const owners = partners.filter((partner) => partner.modules.includes(module));
          return (
            <React.Fragment key={module}>
              <div className="matrix-module">{module}</div>
              <div className="chips">{owners.length ? owners.map((p) => <span key={p.name}>{p.name}</span>) : <em>Coverage gap</em>}</div>
              <div>{owners[0]?.role || "Assign owner"}</div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function RiskPanel({ partners }) {
  return (
    <div className="panel">
      <PanelTitle eyebrow="Risk register" title="Renewals and performance" />
      <div className="risk-list">
        {partners
          .filter((p) => daysTo(p.endDate) <= 180 || p.compliance < 80 || p.status === "At-risk")
          .map((p) => (
            <div className="risk-item" key={p.name}>
              <div><strong>{p.name}</strong><span>{p.status} · ends {p.endDate}</span></div>
              <b className={p.compliance < 80 ? "risk-high" : "risk-watch"}>{p.compliance}%</b>
            </div>
          ))}
      </div>
    </div>
  );
}

function DirectoryTable({ partners, title }) {
  const [sort, setSort] = useState({ key: "name", direction: "asc" });
  const sortedPartners = useMemo(() => {
    const copy = [...partners];
    copy.sort((a, b) => {
      const sorters = {
        name: [a.name, b.name],
        type: [a.type, b.type],
        funding: [a.disbursed, b.disbursed],
        status: [a.status, b.status],
        endDate: [daysTo(a.endDate), daysTo(b.endDate)],
        compliance: [a.compliance, b.compliance]
      };
      const [left, right] = sorters[sort.key] || sorters.name;
      const result = typeof left === "number" ? left - right : String(left).localeCompare(String(right));
      return sort.direction === "asc" ? result : -result;
    });
    return copy;
  }, [partners, sort]);

  function changeSort(key) {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc"
    }));
  }

  return (
    <section className="panel directory-panel">
      <PanelTitle eyebrow="Partner directory" title={title} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <SortableTh label="Partner" sortKey="name" sort={sort} onSort={changeSort} />
              <SortableTh label="Type" sortKey="type" sort={sort} onSort={changeSort} />
              <th>Support</th>
              <th>eLMIS role</th>
              <th>Coverage</th>
              <SortableTh label="Funding" sortKey="funding" sort={sort} onSort={changeSort} />
              <SortableTh label="Status" sortKey="status" sort={sort} onSort={changeSort} />
              <SortableTh label="End date" sortKey="endDate" sort={sort} onSort={changeSort} />
              <SortableTh label="Compliance" sortKey="compliance" sort={sort} onSort={changeSort} />
              <th>Renewal alert</th>
              <th>Focal person</th>
            </tr>
          </thead>
          <tbody>{sortedPartners.map((p) => (
            <tr key={p.name}>
              <td><strong>{p.name}</strong><span>{p.products.join(", ")}</span></td>
              <td>{p.type}</td>
              <td>{p.support.join(", ")}</td>
              <td>{p.role}</td>
              <td>{p.provinces.join(", ")}<span>{p.facilities || "National"} facilities</span></td>
              <td>{money(p.disbursed)}<span>of {money(p.committed)}</span></td>
              <td><StatusPill status={p.status} /></td>
              <td>{p.endDate}<span>{daysTo(p.endDate)} days</span></td>
              <td>{p.compliance}%</td>
              <td><RenewalAlert partner={p} /></td>
              <td>{p.focal}<span>Last activity {p.lastActivity}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </section>
  );
}

function SortableTh({ label, sortKey, sort, onSort }) {
  const marker = sort.key === sortKey ? (sort.direction === "asc" ? "up" : "down") : "";
  return (
    <th>
      <button type="button" className="sort-button" onClick={() => onSort(sortKey)}>
        {label}<span>{marker}</span>
      </button>
    </th>
  );
}

function CompactTable({ headers, rows }) {
  return (
    <div className="table-wrap compact">
      <table>
        <thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function StatRow({ label, value, detail }) {
  return <div className="stat-row"><span>{label}{detail ? <small>{detail}</small> : null}</span><strong>{value}</strong></div>;
}

function PanelTitle({ eyebrow, title, aside }) {
  return (
    <div className="panel-heading">
      <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      {aside ? <span className="legend">{aside}</span> : null}
    </div>
  );
}

function Kpi({ label, value, detail }) {
  return <article className="kpi-card"><span>{label}</span><strong>{value}</strong><p>{detail}</p></article>;
}

function StatusPill({ status }) {
  return <span className={`status status-${status.toLowerCase().replace("-", "")}`}><i />{status}</span>;
}

function RenewalAlert({ partner }) {
  const level = renewalLevel(partner);
  return <span className={`renewal ${level.className}`}>{level.label}</span>;
}

function alertFlag(partner) {
  const days = daysTo(partner.endDate);
  if (partner.status === "At-risk" || partner.compliance < 80 || days <= 60) return { label: "At Risk", className: "alert-risk" };
  if (partner.compliance < 88 || days <= 120) return { label: "Needs Attention", className: "alert-watch" };
  return { label: "On Track", className: "alert-ok" };
}

function renewalLevel(partner) {
  const days = daysTo(partner.endDate);
  if (partner.status === "Completed") return { label: "Closed", className: "renewal-neutral" };
  if (days <= 30) return { label: "30-day alert", className: "renewal-high" };
  if (days <= 60 || partner.status === "At-risk") return { label: "60-day alert", className: "renewal-high" };
  if (days <= 90) return { label: "90-day alert", className: "renewal-watch" };
  if (days <= 120) return { label: "Review soon", className: "renewal-watch" };
  return { label: "On track", className: "renewal-ok" };
}

createRoot(document.getElementById("root")).render(<App />);
