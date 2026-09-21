export type DeliveryZone = {
  name: string;
  states: string[];
  fee: number;
};

export const deliveryZones: DeliveryZone[] = [
  {
    name: "Ogun",
    states: ["Ogun"],
    fee: 3500,
  },
  {
    name: "Lagos",
    states: ["Lagos"],
    fee: 4000,
  },
  {
    name: "Southwest",
    states: [
      "Oyo",
      "Osun",
      "Ondo",
      "Ekiti",
    ],
    fee: 4000,
  },
  {
    name: "South South",
    states: [
      "Edo",
      "Delta",
      "Rivers",
      "Bayelsa",
      "Cross River",
      "Akwa Ibom",
    ],
    fee: 4500,
  },
  {
    name: "Southeast",
    states: [
      "Anambra",
      "Enugu",
      "Imo",
      "Abia",
      "Ebonyi",
    ],
    fee: 4500,
  },
  {
    name: "Abuja / North Central",
    states: [
      "Federal Capital Territory",
      "Benue",
      "Kogi",
      "Kwara",
      "Nasarawa",
      "Niger",
      "Plateau",
    ],
    fee: 5000,
  },
  {
    name: "Northern Nigeria",
    states: [
      "Adamawa",
      "Bauchi",
      "Borno",
      "Gombe",
      "Jigawa",
      "Kaduna",
      "Kano",
      "Katsina",
      "Kebbi",
      "Sokoto",
      "Taraba",
      "Yobe",
      "Zamfara",
    ],
    fee: 5000,
  },
];

export function getDeliveryFee(state: string): number {
  const zone = deliveryZones.find((zone) =>
    zone.states.includes(state)
  );

  return zone?.fee ?? 5000;
}