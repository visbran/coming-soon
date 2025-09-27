type SocialIcon = {
    icon: string;
    link: string;
};

type SiteData = {
    sitename: string;
    sitetagline: string;
    siteurl: string;
    sitelogo: string;
    title: string;
    description: string;
    copyrightText: string;
    socialIconsHeading: string;
    socialIcons: SocialIcon[];
};

const currentYear = new Date().getFullYear();
const data: SiteData = {
    sitename: "LMF Solutions",
    sitetagline: "Quelque chose de grand se prépare ! ✨ 🔥",
    siteurl: "https://lmfsolutions.fr",
    sitelogo: "",
    title: "Bientôt disponible !",
    description: "Nous travaillons actuellement 👨‍💻 d'arrache-pied pour vous offrir quelque chose d'exceptionnel, et nous sommes impatients de le partager avec vous 📅. Notre équipe met la touche finale à un nouveau projet 🚀 que vous allez adorer 😍.",
    copyrightText: `Copyright © ${currentYear} | LMF Solutions`,
    socialIconsHeading: "Suivez-nous 📣",
    socialIcons: [],
};

export default data;
export type { SiteData, SocialIcon };
