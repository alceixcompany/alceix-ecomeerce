import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/modules/marketing-blog/data/posts";
import { ArticleScreen } from "@/modules/marketing-blog/screens/article-screen";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return blogPosts.map(post => ({slug:post.slug})); }
export async function generateMetadata({params}:Props):Promise<Metadata> { const {slug}=await params; const post=getBlogPost(slug); return { title: post ? `${post.title} | Alceix Blog` : "Yazı bulunamadı | Alceix", description:post?.excerpt }; }
export default async function Page({params}:Props) { const {slug}=await params; const post=getBlogPost(slug); if(!post) notFound(); return <ArticleScreen post={post} />; }
