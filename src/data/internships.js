/**
 * Sample internship data — used until the backend API is connected.
 *
 * Each object mirrors the shape of the Internship entity in the backend:
 *   id, title, company, location, description, stipend, deadline
 *
 * Props explained:
 *   - tags: short labels shown as badges on cards
 *   - logo: emoji placeholder (will be replaced with real logos later)
 */
const internships = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "Google",
    location: "Bangalore",
    stipend: 40000,
    deadline: "2026-11-30",
    logo: "🟢",
    tags: ["React", "JavaScript", "CSS"],
    description:
      "Work with the Google Cloud Console team to build responsive, accessible UI components using React. You will collaborate with designers and backend engineers to ship features used by millions of developers worldwide.",
  },
  {
    id: 2,
    title: "Backend Engineering Intern",
    company: "Microsoft",
    location: "Hyderabad",
    stipend: 45000,
    deadline: "2026-12-15",
    logo: "🔵",
    tags: ["Java", "Spring Boot", "Azure"],
    description:
      "Join the Azure DevOps team to design and implement RESTful microservices. You will gain hands-on experience with CI/CD pipelines, cloud infrastructure, and large-scale distributed systems.",
  },
  {
    id: 3,
    title: "Data Science Intern",
    company: "Amazon",
    location: "Remote",
    stipend: 35000,
    deadline: "2026-11-20",
    logo: "🟠",
    tags: ["Python", "ML", "SQL"],
    description:
      "Analyse customer behaviour data to build recommendation models. Work alongside senior data scientists using Python, Pandas, and scikit-learn to drive business insights for Amazon Prime.",
  },
  {
    id: 4,
    title: "Mobile App Intern",
    company: "Flipkart",
    location: "Bangalore",
    stipend: 30000,
    deadline: "2026-12-01",
    logo: "🟡",
    tags: ["React Native", "Firebase", "UI/UX"],
    description:
      "Help build and optimize the Flipkart mobile shopping experience for millions of users. You will work on performance improvements, A/B testing, and new feature rollouts.",
  },
  {
    id: 5,
    title: "DevOps Intern",
    company: "Razorpay",
    location: "Bangalore",
    stipend: 38000,
    deadline: "2026-12-10",
    logo: "🔷",
    tags: ["Docker", "Kubernetes", "AWS"],
    description:
      "Automate infrastructure provisioning and deployment pipelines. Gain experience with Docker, Kubernetes, Terraform, and monitoring tools in a fast-paced fintech environment.",
  },
  {
    id: 6,
    title: "UI/UX Design Intern",
    company: "Swiggy",
    location: "Remote",
    stipend: 25000,
    deadline: "2026-11-25",
    logo: "🟧",
    tags: ["Figma", "Prototyping", "Research"],
    description:
      "Design intuitive user flows for the Swiggy food delivery app. Conduct user research, create wireframes and high-fidelity prototypes, and collaborate closely with engineers.",
  },
];

export default internships;
