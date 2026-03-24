export const NETWORK_CHOICES = [
  {
    key: "private",
    label: "Private",
    description: "Accessible only by invite",
    iconKey: "Lock" as const,
  },
  {
    key: "public",
    label: "Public",
    description: "Anyone in the workspace can join",
    iconKey: "Globe" as const,
  },
];
