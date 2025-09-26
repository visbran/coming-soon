type SocialIcon = {
    icon: string;
    link: string;
};

type HideConfig = {
    subscribeForm: boolean;
    header: boolean;
    content: boolean;
    footer: boolean;
};

type SiteData = {
    sitename: string;
    sitetagline: string;
    siteurl: string;
    sitelogo: string;
    title: string;
    description: string;
    newsletterheading: string;
    copyrightText: string;
    socialIconsHeading: string;
    hideSubscribeForm: boolean;
    socialIcons: SocialIcon[];
    hide: HideConfig;
};

const currentYear = new Date().getFullYear();
const data: SiteData = {
    sitename: "LMF Solutions",
    sitetagline: "Quelque chose de grand se prépare ! ✨ 🔥",
    siteurl: "https://lmfsolutions.fr",
    sitelogo: "",
    title: "Bientôt disponible !",
    description: "Nous travaillons actuellement 👨‍💻 d'arrache-pied pour vous offrir quelque chose d'exceptionnel, et nous sommes impatients de le partager avec vous 📅. Notre équipe met la touche finale à un nouveau projet 🚀 que vous allez adorer 😍.",
    newsletterheading: "Restez informés de nos actualités !",
    copyrightText: `Copyright © ${currentYear} | LMF Solutions`,
    socialIconsHeading: "Suivez-nous 📣",
    hideSubscribeForm: false, // make true to disable subscription form 
    socialIcons: [],
    hide :{
        subscribeForm: false, // make true to disable subscription form         
        header: false,
        content: false,
        footer: false,
    }
}

export default data;
export type { SiteData, SocialIcon };
