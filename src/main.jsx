import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const partners = [
  {
    name: "USAID GHSC-PSM",
    type: "Bilateral",
    support: ["Financial", "Technical", "Training"],
    modules: ["Requisitions", "Order approval", "Analytics"],
    role: "Requisition approver",
    provinces: ["Lusaka", "Copperbelt", "Southern", "Eastern"],
    products: ["HIV", "Malaria", "Essential medicines"],
    committed: 5200000,
    disbursed: 4100000,
    compliance: 91,
    facilities: 462,
    status: "Active",
    endDate: "2026-09-30",
    focal: "MoH LMU / USAID",
    lastActivity: "2026-05-24"
  },
  {
    name: "Global Fund",
    type: "Multilateral",
    support: ["Financial", "Governance"],
    modules: ["Analytics", "Reporting", "Master data"],
    role: "Data viewer",
    provinces: ["Lusaka", "Copperbelt", "North-Western", "Western"],
    products: ["HIV", "TB", "Malaria"],
    committed: 4800000,
    disbursed: 3500000,
    compliance: 87,
    facilities: 388,
    status: "Active",
    endDate: "2027-03-31",
    focal: "MoH Grants Unit",
    lastActivity: "2026-05-18"
  },
  {
    name: "UNICEF",
    type: "Multilateral",
    support: ["Technical", "Training", "Commodities"],
    modules: ["Inventory", "Reporting", "Facility support"],
    role: "Trainer",
    provinces: ["Luapula", "Northern", "Muchinga", "Eastern"],
    products: ["Vaccines", "Nutrition", "Child health"],
    committed: 2100000,
    disbursed: 1600000,
    compliance: 94,
    facilities: 274,
    status: "Active",
    endDate: "2026-12-15",
    focal: "EPI Programme",
    lastActivity: "2026-05-27"
  },
  {
    name: "CHAI",
    type: "NGO",
    support: ["Technical", "Analytics"],
    modules: ["Analytics", "Interoperability", "Dashboards"],
    role: "System admin",
    provinces: ["Lusaka", "Central", "Southern"],
    products: ["HIV", "Maternal health"],
    committed: 1250000,
    disbursed: 1010000,
    compliance: 82,
    facilities: 195,
    status: "Active",
    endDate: "2026-08-20",
    focal: "Digital Health Unit",
    lastActivity: "2026-05-14"
  },
  {
    name: "JICA",
    type: "Bilateral",
    support: ["Infrastructure", "Training"],
    modules: ["Warehouse", "Order approval", "Inventory"],
    role: "Warehouse mentor",
    provinces: ["Lusaka", "Copperbelt"],
    products: ["Essential medicines", "Lab commodities"],
    committed: 1850000,
    disbursed: 910000,
    compliance: 73,
    facilities: 88,
    status: "At-risk",
    endDate: "2026-07-31",
    focal: "ZAMMSA Operations",
    lastActivity: "2026-04-29"
  },
  {
    name: "World Bank",
    type: "Multilateral",
    support: ["Financial", "Governance"],
    modules: ["Master data", "Reporting"],
    role: "Accountable owner",
    provinces: ["National"],
    products: ["All programmes"],
    committed: 3300000,
    disbursed: 2500000,
    compliance: 89,
    facilities: 0,
    status: "Active",
    endDate: "2027-06-30",
    focal: "MoH Planning",
    lastActivity: "2026-05-21"
  },
  {
    name: "Crown Agents",
    type: "Private",
    support: ["Technical", "Infrastructure"],
    modules: ["Warehouse", "Integration support"],
    role: "Consulted specialist",
    provinces: ["Lusaka", "Central"],
    products: ["Procurement", "Warehousing"],
    committed: 760000,
    disbursed: 760000,
    compliance: 97,
    facilities: 42,
    status: "Completed",
    endDate: "2026-05-31",
    focal: "ZAMMSA ICT",
    lastActivity: "2026-05-30"
  },
  {
    name: "PATH",
    type: "NGO",
    support: ["Training", "Analytics"],
    modules: ["Facility support", "Reporting"],
    role: "Trainer",
    provinces: ["Western", "Southern", "Eastern"],
    products: ["Vaccines", "Malaria"],
    committed: 940000,
    disbursed: 510000,
    compliance: 78,
    facilities: 214,
    status: "Planned",
    endDate: "2027-01-15",
    focal: "EPI Programme",
    lastActivity: "2026-05-03"
  }
];

const provinces = [
  "Central",
  "Copperbelt",
  "Eastern",
  "Luapula",
  "Lusaka",
  "Muchinga",
  "Northern",
  "North-Western",
  "Southern",
  "Western"
];

const filters = ["All", "Financial", "Technical", "Training", "Commodities", "Infrastructure", "Governance"];

function money(value) {
  return `$${(value / 1000000).toFixed(value >= 1000000 ? 1 : 2)}M`;
}

function daysTo(dateString) {
  const today = new Date("2026-06-04T00:00:00");
  const end = new Date(`${dateString}T00:00:00`);
  return Math.ceil((end - today) / 86400000);
}

function App() {
  const [supportFilter, setSupportFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");

  const visiblePartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesSupport = supportFilter === "All" || partner.support.includes(supportFilter);
      const matchesStatus = statusFilter === "All" || partner.status === statusFilter;
      const haystack = [
        partner.name,
        partner.type,
        partner.role,
        partner.focal,
        ...partner.modules,
        ...partner.provinces,
        ...partner.products
      ]
        .join(" ")
        .toLowerCase();
      return matchesSupport && matchesStatus && haystack.includes(query.toLowerCase());
    });
  }, [supportFilter, statusFilter, query]);

  const totals = useMemo(() => {
    const committed = visiblePartners.reduce((sum, partner) => sum + partner.committed, 0);
    const disbursed = visiblePartners.reduce((sum, partner) => sum + partner.disbursed, 0);
    const facilities = visiblePartners.reduce((sum, partner) => sum + partner.facilities, 0);
    const expiring = visiblePartners.filter((partner) => daysTo(partner.endDate) <= 120).length;
    return { committed, disbursed, facilities, expiring };
  }, [visiblePartners]);

  const provinceCoverage = provinces.map((province) => ({
    province,
    count: visiblePartners.filter((partner) => partner.provinces.includes(province) || partner.provinces.includes("National")).length
  }));

  const moduleRows = ["Requisitions", "Order approval", "Inventory", "Reporting", "Analytics", "Warehouse", "Master data", "Interoperability"];
  const statusOptions = ["All", "Active", "Planned", "At-risk", "Completed"];

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Ministry of Health Zambia</p>
          <h1>eLMIS Partner Mapping Dashboard</h1>
          <p className="subtitle">Operational view of partner coverage, eLMIS roles, funding execution, and expiring agreements.</p>
        </div>
        <div className="actions">
          <button type="button">Export report</button>
          <button type="button" className="alert-button">{totals.expiring} expiring soon</button>
        </div>
      </header>

      <section className="filter-band" aria-label="Dashboard filters">
        <label>
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Partner, province, module, focal person" />
        </label>
        <label>
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {statusOptions.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <div className="segmented" role="group" aria-label="Support type">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={filter === supportFilter ? "selected" : ""}
              onClick={() => setSupportFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="kpi-grid" aria-label="Summary KPIs">
        <Kpi label="Mapped partners" value={visiblePartners.length} detail={`${visiblePartners.filter((p) => p.status === "Active").length} active`} />
        <Kpi label="Committed funding" value={money(totals.committed)} detail={`${money(totals.disbursed)} disbursed`} />
        <Kpi label="Facilities assigned" value={totals.facilities.toLocaleString()} detail="Excludes national-only support" />
        <Kpi label="Average compliance" value={`${Math.round(visiblePartners.reduce((sum, p) => sum + p.compliance, 0) / visiblePartners.length || 0)}%`} detail="Deliverables and reporting" />
      </section>

      <section className="layout-grid">
        <div className="panel map-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Geographic mapping</p>
              <h2>Partner density by province</h2>
            </div>
            <span className="legend">Partners covering province</span>
          </div>
          <div className="province-map">
            {provinceCoverage.map(({ province, count }) => (
              <div className={`province level-${Math.min(count, 5)}`} key={province}>
                <span>{province}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Funding execution</p>
              <h2>Committed vs disbursed</h2>
            </div>
          </div>
          <div className="funding-bars">
            {visiblePartners.slice(0, 6).map((partner) => (
              <div className="funding-row" key={partner.name}>
                <div className="funding-label">
                  <span>{partner.name}</span>
                  <strong>{money(partner.committed)}</strong>
                </div>
                <div className="bar-track">
                  <span className="bar-committed" style={{ width: "100%" }} />
                  <span className="bar-disbursed" style={{ width: `${Math.round((partner.disbursed / partner.committed) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="layout-grid wide-left">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Functional mapping</p>
              <h2>eLMIS module and RACI view</h2>
            </div>
          </div>
          <div className="module-matrix">
            <div className="matrix-header">Module</div>
            <div className="matrix-header">Partners</div>
            <div className="matrix-header">Primary role</div>
            {moduleRows.map((module) => {
              const owners = visiblePartners.filter((partner) => partner.modules.includes(module));
              return (
                <React.Fragment key={module}>
                  <div className="matrix-module">{module}</div>
                  <div className="chips">
                    {owners.length ? owners.map((partner) => <span key={partner.name}>{partner.name}</span>) : <em>Coverage gap</em>}
                  </div>
                  <div>{owners[0]?.role || "Assign owner"}</div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Risk register</p>
              <h2>Renewals and performance</h2>
            </div>
          </div>
          <div className="risk-list">
            {visiblePartners
              .filter((partner) => daysTo(partner.endDate) <= 180 || partner.compliance < 80 || partner.status === "At-risk")
              .map((partner) => (
                <div className="risk-item" key={partner.name}>
                  <div>
                    <strong>{partner.name}</strong>
                    <span>{partner.status} · ends {partner.endDate}</span>
                  </div>
                  <b className={partner.compliance < 80 ? "risk-high" : "risk-watch"}>{partner.compliance}%</b>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="panel directory-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Partner directory</p>
            <h2>Coverage, roles, dates, and focal persons</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Partner</th>
                <th>Type</th>
                <th>Support</th>
                <th>eLMIS role</th>
                <th>Coverage</th>
                <th>Funding</th>
                <th>Status</th>
                <th>End date</th>
                <th>Focal person</th>
              </tr>
            </thead>
            <tbody>
              {visiblePartners.map((partner) => (
                <tr key={partner.name}>
                  <td><strong>{partner.name}</strong><span>{partner.products.join(", ")}</span></td>
                  <td>{partner.type}</td>
                  <td>{partner.support.join(", ")}</td>
                  <td>{partner.role}</td>
                  <td>{partner.provinces.join(", ")}<span>{partner.facilities || "National"} facilities</span></td>
                  <td>{money(partner.disbursed)}<span>of {money(partner.committed)}</span></td>
                  <td><StatusPill status={partner.status} /></td>
                  <td>{partner.endDate}<span>{daysTo(partner.endDate)} days</span></td>
                  <td>{partner.focal}<span>Last activity {partner.lastActivity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Kpi({ label, value, detail }) {
  return (
    <article className="kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function StatusPill({ status }) {
  return <span className={`status status-${status.toLowerCase().replace("-", "")}`}>{status}</span>;
}

createRoot(document.getElementById("root")).render(<App />);
