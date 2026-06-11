import {
  Banknote,
  Building2,
  Factory,
  Landmark,
  Leaf,
  RadioTower,
  type LucideIcon
} from "lucide-react";

export type CompanyId =
  | "dbs"
  | "ocbc"
  | "uob"
  | "singtel"
  | "keppel"
  | "capitaland"
  | "wilmar"
  | "sembcorp";

export type MockCompany = {
  id: CompanyId;
  name: string;
  ticker: string;
  sector: string;
  region: string;
  signalTheme: string;
  icon: LucideIcon;
};

export const mockCompanies: MockCompany[] = [
  {
    id: "dbs",
    name: "DBS Group Holdings",
    ticker: "D05.SI",
    sector: "Banking",
    region: "Singapore",
    signalTheme: "transition finance",
    icon: Landmark
  },
  {
    id: "ocbc",
    name: "OCBC",
    ticker: "O39.SI",
    sector: "Banking",
    region: "Singapore",
    signalTheme: "green lending",
    icon: Banknote
  },
  {
    id: "uob",
    name: "UOB",
    ticker: "U11.SI",
    sector: "Banking",
    region: "Singapore",
    signalTheme: "ASEAN decarbonisation",
    icon: Landmark
  },
  {
    id: "singtel",
    name: "Singtel",
    ticker: "Z74.SI",
    sector: "Telecommunications",
    region: "Singapore",
    signalTheme: "network efficiency",
    icon: RadioTower
  },
  {
    id: "keppel",
    name: "Keppel Ltd",
    ticker: "BN4.SI",
    sector: "Infrastructure",
    region: "Singapore",
    signalTheme: "sustainable infrastructure",
    icon: Building2
  },
  {
    id: "capitaland",
    name: "CapitaLand Investment",
    ticker: "9CI.SI",
    sector: "Real estate investment",
    region: "Singapore",
    signalTheme: "low-carbon buildings",
    icon: Building2
  },
  {
    id: "wilmar",
    name: "Wilmar International",
    ticker: "F34.SI",
    sector: "Agribusiness",
    region: "ASEAN",
    signalTheme: "supply chain traceability",
    icon: Leaf
  },
  {
    id: "sembcorp",
    name: "Sembcorp Industries",
    ticker: "U96.SI",
    sector: "Energy",
    region: "Singapore / ASEAN",
    signalTheme: "renewable operations",
    icon: Factory
  }
];
