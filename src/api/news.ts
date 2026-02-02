import api from "./client";

export type ArticleSource = {
  id: string | number;
  name: string;
};

export type ArticleType = {
  source: ArticleSource;
  author: string;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
};

export type NewsApiResponse = {
  status: string;
  totalResults: number;
  articles: ArticleType[];
};

type Search = "title" | "description" | "content";

type RequestParam = {
  q?: string;
  searchIn?: Search[];
  domains?: string;
  excludeDomains?: string;
  from?: string;
  to?: string;
  language?: string;
  sortBy?: "relevancy" | "popularity" | "publishedAt";
  page?: number;
};

export type Country = "ae"|"ar"|"at"|"au"|"be"|"bg"|"br"|"ca"|"ch"|"cn"|"co"|"cu"|"cz"|"de"|"eg"|"fr"|"gb"|"gr"|"hk"|"hu"|"id"|"ie"|"il"|"in"|"it"|"jp"|"kr"|"lt"|"lv"|"ma"|"mx"|"my"|"ng"|"nl"|"no"|"nz"|"ph"|"pl"|"pt"|"ro"|"rs"|"ru"|"sa"|"se"|"sg"|"si"|"sk"|"th"|"tr"|"tw"|"ua"|"us"|"ve"|"za";
export type Category = "business" | "entertainment" | "general" | "health" | "science" | "sports"|"technology";
type HeadlinesRequestParam = {
  country?: Country;
  category?: Category;
  q?: string;
  pageSize?: number;
  page?: number;
}
const everything = async (p: RequestParam) => {
  // Create query string parameters
  const params = new URLSearchParams();
  
  if (p.q) params.append("q", p.q);
  // if (p.searchIn) params.append("searchIn", p.searchIn.join(","));
  if (p.domains) params.append("domains", p.domains);
  if (p.excludeDomains) params.append("excludeDomains", p.excludeDomains);
  if (p.from) params.append("from", p.from);
  if (p.to) params.append("to", p.to);
  if (p.language) params.append("language", p.language);
  if (p.sortBy) params.append("sortBy", p.sortBy);
  if (p.page) params.append("page", p.page.toString());

  console.log(params.toString())
  // Make the API request
  const response = await api.get(`/v2/everything?${params.toString()}`);

  // Return the response data as NewsApiResponse
  return response;
};
const top_headlines = async (p: HeadlinesRequestParam) => {
  // Create query string parameters
  const params = new URLSearchParams();

  if (p.country) params.append("country", p.country);
  if (p.category) params.append("category", p.category);
  if (p.q) params.append("q", p.q);
  if (p.pageSize) params.append("pageSize", p.pageSize.toString());
  if (p.page) params.append("page", p.page.toString());

  // Make the API request
  const response = await api.get(`/v2/top-headlines?${params.toString()}`);

  // Return the response data as NewsApiResponse
  return response;
};

export const NewsApi = {everything: everything, top_headlines: top_headlines}
