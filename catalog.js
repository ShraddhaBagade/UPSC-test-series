export const subjects = new Map([
  ["indian-polity", "Indian Polity"],
  ["modern-history", "Modern History"],
  ["indian-geography", "Indian Geography"],
  ["economics", "Economics"],
  ["environment", "Environment"],
  ["science-and-tech", "Science and Tech"],
  ["ancient-india", "Ancient India"],
  ["medieval-indian-history", "Medieval Indian History"],
  ["art-culture", "Art & Culture"],
]);

const bundlePrices = new Map([
  [3, 24900],
  [5, 39900],
  [9, 69900],
]);

export function priceSelection(type, subjectIds) {
  if (
    !Array.isArray(subjectIds) ||
    !subjectIds.every((id) => typeof id === "string")
  ) {
    throw new Error("Choose your PDFs again.");
  }

  if (
    new Set(subjectIds).size !== subjectIds.length ||
    subjectIds.some((id) => !subjects.has(id))
  ) {
    throw new Error(
      "Your PDF selection contains duplicate or unknown subjects.",
    );
  }

  if (type === "pdf" && subjectIds.length !== 1) {
    throw new Error("Choose exactly one subject for a single PDF.");
  }

  if (type === "bundle" && !bundlePrices.has(subjectIds.length)) {
    throw new Error("Choose exactly 3, 5, or all 9 subjects for a bundle.");
  }

  if (type !== "pdf" && type !== "bundle") {
    throw new Error("Unknown purchase type.");
  }

  return {
    amount: type === "pdf" ? 9900 : bundlePrices.get(subjectIds.length),

    title:
      type === "pdf"
        ? subjects.get(subjectIds[0])
        : subjectIds.length === 9
          ? "Buy All PDFs"
          : `Buy ${subjectIds.length} PDFs`,

    subjectIds,
    subjects: subjectIds.map((id) => subjects.get(id)),
  };
}

export function validateCustomer(customer) {
  const fullName =
    typeof customer?.fullName === "string" ? customer.fullName.trim() : "";

  const email =
    typeof customer?.email === "string"
      ? customer.email.trim().toLowerCase()
      : "";

  const mobile =
    typeof customer?.mobile === "string" ? customer.mobile.trim() : "";

  if (
    fullName.length < 2 ||
    fullName.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    !/^[0-9]{10}$/.test(mobile)
  ) {
    throw new Error(
      "Enter your name, a valid email, and a 10-digit mobile number.",
    );
  }

  return { fullName, email, mobile };
}
