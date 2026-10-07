export type Creator = {
  id: string; name: string; handle: string; initials: string; photo?: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Twitch'; category: 'Moda' | 'Yaşam' | 'Teknoloji';
  audience: 'Kadın' | 'Erkek' | 'Karma'; followers: number; views: number; engagement: number;
  fee: number; format: string; location: string; description: string; images: string[];
};
export type CreatorPortfolio = {
  bio: string; experience: string; languages: string[]; specialties: string[];
  channels: { platform: string; handle: string; followers: number; views: number; engagement: number }[];
  contentMetrics: { format: 'Story'|'Reels'|'Post'|'Video'; platform: string; views: number; reach: number; likes: number; saves: number; count: number }[];
  audience: {label:string;percent:number}[];
  works: {id:string;brand:string;title:string;format:'Story'|'Reels'|'Post'|'Video';image:string;date:string;description:string;views:number;reach:number;clicks:number;deliverables:string[]}[];
};
