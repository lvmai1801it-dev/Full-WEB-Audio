import Link from "next/link";
import { Headphones, Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2">
                            <Headphones className="h-6 w-6 text-orange-500" />
                            <span className="font-bold text-lg">AudioTruyện</span>
                        </Link>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            Nghe truyện audio miễn phí, chất lượng cao với hàng ngàn tác phẩm hấp dẫn.
                        </p>
                    </div>

                    {/* Thể loại */}
                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                            Thể loại
                        </h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li>
                                <Link href="/genre/tien-hiep" className="text-zinc-500 hover:text-orange-500 dark:text-zinc-400">
                                    Tiên Hiệp
                                </Link>
                            </li>
                            <li>
                                <Link href="/genre/kiem-hiep" className="text-zinc-500 hover:text-orange-500 dark:text-zinc-400">
                                    Kiếm Hiệp
                                </Link>
                            </li>
                            <li>
                                <Link href="/genre/ngon-tinh" className="text-zinc-500 hover:text-orange-500 dark:text-zinc-400">
                                    Ngôn Tình
                                </Link>
                            </li>
                            <li>
                                <Link href="/genre/trinh-tham" className="text-zinc-500 hover:text-orange-500 dark:text-zinc-400">
                                    Trinh Thám
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Thể loại 2 */}
                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                            Khám phá
                        </h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li>
                                <Link href="/genre/truyen-ma" className="text-zinc-500 hover:text-orange-500 dark:text-zinc-400">
                                    Truyện Ma
                                </Link>
                            </li>
                            <li>
                                <Link href="/genre/kinh-di" className="text-zinc-500 hover:text-orange-500 dark:text-zinc-400">
                                    Kinh Dị
                                </Link>
                            </li>
                            <li>
                                <Link href="/genre/hai-huoc" className="text-zinc-500 hover:text-orange-500 dark:text-zinc-400">
                                    Hài Hước
                                </Link>
                            </li>
                            <li>
                                <Link href="/genre/lich-su" className="text-zinc-500 hover:text-orange-500 dark:text-zinc-400">
                                    Lịch Sử
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Liên kết */}
                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                            Hỗ trợ
                        </h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li>
                                <Link href="/search" className="text-zinc-500 hover:text-orange-500 dark:text-zinc-400">
                                    Tìm kiếm
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin" className="text-zinc-500 hover:text-orange-500 dark:text-zinc-400">
                                    Quản trị
                                </Link>
                            </li>
                            <li>
                                <span className="text-zinc-400 dark:text-zinc-500">
                                    Email: support@audiotryen.com
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 md:flex-row">
                    <p>© 2024 AudioTruyện. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                            <Github className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
