# MoH eLMIS Partner Mapping - Power BI Package

Generated from the React dashboard source data.

## Files

- `MoH_eLMIS_Partner_Mapping_PowerBI_Dataset.xlsx`: multi-sheet Power BI import workbook.
- `csv/`: one CSV per fact, bridge, and dimension table.
- `MoH_eLMIS_Partner_Mapping_Measures.dax`: suggested DAX measures to paste into Power BI.
- `PowerBI_Dataset_Summary_Preview.png`: workbook preview.

## Recommended Power BI Relationships

- `FactPartners[PartnerID]` -> `FactFunding[PartnerID]`
- `FactPartners[PartnerID]` -> `FactPerformance[PartnerID]`
- `FactPartners[PartnerID]` -> `BridgePartnerProvince[PartnerID]`
- `DimProvince[Province]` -> `BridgePartnerProvince[Province]`
- `FactPartners[PartnerID]` -> `BridgePartnerSupport[PartnerID]`
- `DimSupportType[SupportType]` -> `BridgePartnerSupport[SupportType]`
- `FactPartners[PartnerID]` -> `BridgePartnerModule[PartnerID]`
- `DimModule[eLMISModule]` -> `BridgePartnerModule[eLMISModule]`
- `FactPartners[PartnerID]` -> `BridgePartnerProduct[PartnerID]`
- `DimProduct[ProductCategory]` -> `BridgePartnerProduct[ProductCategory]`

## Map Setup

Use `DimProvince[Latitude]` and `DimProvince[Longitude]` for map visuals. Use `BridgePartnerProvince[AllocatedFacilities]` for province-level facility counts.

## Data Freshness

- Data as of: 2026-06-05
- Refresh schedule: Weekly every Monday 08:00 CAT
- Sources: Partner reports, DHIS2 org units, ZAMMSA WHXpert, eLMIS requisition metadata, MoH grant records
