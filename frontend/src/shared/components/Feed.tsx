import { useEffect, useMemo, useState } from 'react';
import {
  createPostComment,
  fetchFeedPosts,
  fetchPostComments,
  fetchTugasReminders,
  likeFeedPost,
  type FeedComment,
  type FeedPost,
  type ReminderItem,
  unlikeFeedPost,
} from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import PostCard from './PostCard';

const statusSections = [
  { code: 'new', title: '📌 Tugas Baru' },
  { code: 'h3', title: '⏰ H-3' },
  { code: 'h2', title: '⚠️ H-2' },
  { code: 'h1', title: '🔥 H-1' },
  { code: 'h0', title: '🚨 H0' },
] as const;

interface FeedProps {
  showStatusPanel?: boolean;
}

export default function Feed({ showStatusPanel = true }: FeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<number, FeedComment[]>>({});
  const [statusItems, setStatusItems] = useState<ReminderItem[]>([]);

  const canComment = Boolean(user?.id);

  const loadPosts = async () => {
    const postData = await fetchFeedPosts(user?.id);
    setPosts(postData);
  };

  const loadStatusPanel = async () => {
    if (!user) return;
    const statusData = await fetchTugasReminders(user.role, user.id);
    setStatusItems(statusData);
  };

  useEffect(() => {
    void loadPosts();
    void loadStatusPanel();
  }, [user?.id, user?.role]);

  const getCommentsForPost = async (postId: number) => {
    if (commentsMap[postId]) return;
    const comments = await fetchPostComments(postId);
    setCommentsMap((prev) => ({ ...prev, [postId]: comments }));
  };

  const handleToggleLike = async (post: FeedPost) => {
    if (!user?.id) return;

    if (post.liked_by_me) {
      await unlikeFeedPost(post.id, user.id);
    } else {
      await likeFeedPost(post.id, user.id);
    }

    await loadPosts();
  };

  const handleSendComment = async (postId: number, text: string) => {
    if (!user?.id) return;
    await createPostComment(postId, user.id, text);
    const comments = await fetchPostComments(postId);
    setCommentsMap((prev) => ({ ...prev, [postId]: comments }));
    await loadPosts();
  };

  const groupedStatus = useMemo(() => {
    const grouped: Record<string, ReminderItem[]> = {};
    for (const section of statusSections) grouped[section.code] = [];

    for (const item of statusItems) {
      if (grouped[item.status_code]) {
        grouped[item.status_code].push(item);
      }
    }

    return grouped;
  }, [statusItems]);

  return (
    <section
      className={`grid gap-4 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4 ${
        showStatusPanel ? "lg:grid-cols-[1.5fr_1fr]" : "grid-cols-1"
      }`}
    >
      <div className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-100">Unified Feed</h2>
          <span className="text-xs text-slate-400">Admin • Ormawa • UKM</span>
        </header>

        <div className="space-y-3">
          {posts.map((post) => {
            const comments = commentsMap[post.id] || [];
            return (
              <div key={post.id} onMouseEnter={() => void getCommentsForPost(post.id)}>
                <PostCard
                  post={post}
                  comments={comments}
                  canComment={canComment}
                  onToggleLike={handleToggleLike}
                  onOpenComments={getCommentsForPost}
                  onSendComment={handleSendComment}
                />
              </div>
            );
          })}

          {posts.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-400">
              Belum ada postingan dari UKM, ORMAWA, atau Admin.
            </div>
          ) : null}
        </div>
      </div>

      {showStatusPanel ? (
        <aside className="rounded-xl border border-slate-700 bg-slate-950/65 p-4">
          <h3 className="text-sm font-semibold text-slate-100">AI Task Status</h3>
          <p className="mt-1 text-xs text-slate-400">Panel ini murni render status dari OpenClaw.</p>

          <div className="mt-3 space-y-3">
            {statusSections.map((section) => {
              const items = groupedStatus[section.code] || [];
              return (
                <div key={section.code} className="rounded-lg border border-slate-700/80 px-3 py-2">
                  <p className="text-xs font-semibold text-cyan-200">{section.title}</p>
                  {items.length === 0 ? (
                    <p className="mt-1 text-xs text-slate-500">-</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {items.slice(0, 5).map((item) => (
                        <li key={`${section.code}-${item.id}`} className="text-xs text-slate-300">
                          {item.course_name} - {item.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      ) : null}
    </section>
  );
}

