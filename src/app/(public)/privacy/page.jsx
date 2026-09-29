import PageHeader from "@/components/Public/PageHeader";

export const metadata = {
  title: "Privacy policy",
  description: "What personal data Layan collects, why, and the rights you have over it.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    title: "1. Who we are",
    body: "Layan is a booking platform for beauty businesses. This policy explains what we collect when you use it, why we collect it, and what you can ask us to do with it.",
  },
  {
    title: "2. Customer accounts",
    body: "When you sign in we store your name, email address and optional phone number, along with your booking history, saved favourites and any review you write. Authentication is handled by Firebase; we store the resulting profile in our own database so businesses can see who they have booked.",
  },
  {
    title: "3. Business accounts",
    body: "Businesses provide trading details including a contact email, an address, service prices and staff information. This is published on your Layan profile so customers can book you. You control what you publish and can update or remove it at any time.",
  },
  {
    title: "4. What we do not do",
    body: "We do not sell your personal data. We do not use your booking history to advertise to you. We do not share your contact details with businesses beyond what is needed to fulfil a booking you have made.",
  },
  {
    title: "5. Legal basis",
    body: "We process your data to perform the contract you enter into with us when you make a booking or list a business, to meet our legal obligations as a marketplace operator, and — where you have consented — to send you service announcements.",
  },
  {
    title: "6. Retention",
    body: "Booking and transaction records are retained for the period required by UK tax and accounting law. Review content is retained while a listing is live. If you delete your account we remove or anonymise your personal data, except where retention is legally required.",
  },
  {
    title: "7. Your rights",
    body: "You have the right to access your data, correct it, delete it, restrict or object to its processing, and receive a portable copy. Contact us and we will respond within thirty days. You also have the right to complain to the Information Commissioner's Office.",
  },
  {
    title: "8. Cookies",
    body: "Layan stores your session in your browser's local storage so you stay signed in between visits. We do not use advertising or cross-site tracking cookies.",
  },
  {
    title: "9. Security",
    body: "Passwords are stored only as salted hashes and are never recoverable. Data is transmitted over TLS. No system is perfectly secure, but we treat the security of your data as a responsibility rather than a checkbox.",
  },
  {
    title: "10. Contact",
    body: "For any privacy question, or to exercise one of the rights above, email privacy@layan.app.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        description="What we collect, why we collect it, and what you can ask us to do with it."
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
