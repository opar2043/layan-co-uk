import PageHeader from "@/components/Public/PageHeader";

export const metadata = {
  title: "Terms of service",
  description: "The terms that govern the use of Layan by customers and businesses.",
  alternates: { canonical: "/terms" },
};

const SECTIONS = [
  {
    title: "1. About these terms",
    body: "These terms govern your use of Layan, the platform that connects customers with salons, barbers and nail bars. By creating an account or making a booking you agree to them. If you do not agree, please do not use Layan.",
  },
  {
    title: "2. Accounts",
    body: "You must be at least 18 years old to hold a business account. You are responsible for keeping your login credentials secure and for all activity under your account. Business owners are responsible for the accuracy of the information they publish.",
  },
  {
    title: "3. Bookings",
    body: "A booking is a request for an appointment. It becomes confirmed once the business accepts it. Prices shown at the time of booking are the prices charged; Layan does not alter them afterwards. Deposits are set by the individual business.",
  },
  {
    title: "4. Cancellations and no-shows",
    body: "Each business publishes its own cancellation policy on its Layan profile. Repeated late cancellations and no-shows may lead to a business declining future bookings, and are visible to Layan for the purpose of platform integrity.",
  },
  {
    title: "5. Reviews",
    body: "Only customers who attended an appointment may review it, once per booking. Reviews must be genuine. Businesses may reply publicly to a review but may not remove it. We may remove reviews that are abusive, fraudulent or defamatory.",
  },
  {
    title: "6. Business verification",
    body: "Layan verifies businesses before they appear in public search. Verification confirms that a business is genuine; it is not an endorsement of the quality of its work. We may suspend a listing that is misleading, inactive or non-compliant.",
  },
  {
    title: "7. Payments",
    body: "Payment handling for bookings is completed between you and the business. Layan does not hold customer funds in escrow. Any refund is governed by the business's cancellation policy and applicable law.",
  },
  {
    title: "8. Intellectual property",
    body: "The Layan name, logo and interface are our property. Businesses retain ownership of the photographs and descriptions they upload, and grant us a licence to display them in order to operate the marketplace.",
  },
  {
    title: "9. Liability",
    body: "Layan provides a booking platform. We are not liable for the quality of a service performed, and our liability for any claim arising from your use of the platform is limited to the greater of the amount you paid us in the preceding twelve months, or fifty pounds.",
  },
  {
    title: "10. Changes",
    body: "We may update these terms. Material changes will be announced on the platform at least fourteen days before they take effect. Continuing to use Layan after that date constitutes acceptance.",
  },
];

export default function TermsPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <PageHeader
        eyebrow="Legal"
        title="Terms of service"
        description="Last updated alongside the Layan beta launch."
      />

      <div className="mt-12 max-w-3xl space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-2.5 text-lg">{section.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
