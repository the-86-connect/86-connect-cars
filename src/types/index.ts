export type FuelType = "Electric" | "Hybrid" | "Petrol" | "Diesel";
export type BodyType = "Sedan" | "SUV" | "Coupe" | "Hatchback" | "Truck" | "Pickup" | "Van" | "Bus";
export type Transmission = "Automatic" | "Manual" | "Single-Speed";
export type Drivetrain = "FWD" | "RWD" | "AWD" | "4x4" | "4x2";
export type Condition = "New" | "Used" | "Certified Pre-Owned";
export type Availability = "In Stock" | "On Request" | "Sold";
export type HandDrive = "LHD" | "RHD";

export interface VehicleSpecs {
  power: string;
  torque: string;
  acceleration: string;
  topSpeed: string;
  range?: string;
  fuelEconomy?: string;
  batteryCapacity?: string;
  chargingTime?: string;
  engineDisplacement?: string;
  drivetrain: Drivetrain;
  length: string;
  width: string;
  height: string;
  wheelbase: string;
  weight: string;
  seatingCapacity: number;
  bootSpace?: string;
  payloadCapacity?: string;
  cargoVolume?: string;
}

export interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel: FuelType;
  bodyType: BodyType;
  transmission: Transmission;
  image: string;
  images: string[];
  video?: string;
  badge?: string;
  range?: string;
  engine?: string;
  description: string;
  specs: VehicleSpecs;
  features: string[];
  colors: string[];
  condition: Condition;
  availability: Availability;
  mileage?: number;
  // Export-specific fields
  fobPrice?: number;
  portOfLoading?: string;
  handDrive?: HandDrive;
  shippingEstimate?: string;
  exportDocs?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  country: string;
  flag: string;
  rating: number;
  quote: string;
  avatar: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface QuoteFormData {
  name: string;
  whatsapp: string;
  email: string;
  country: string;
  vehicleBrand: string;
  model: string;
  budget: string;
  message: string;
  referenceImage?: File;
}
