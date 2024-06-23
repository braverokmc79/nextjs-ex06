"use client"
import { useOptimistic } from 'react'; // 낙관적 UI 업데이트를 위해 사용

import { formatDate } from '@/lib/format'; // 날짜 형식 변환 함수 가져오기
import LikeButton from './like-icon'; // 좋아요 버튼 컴포넌트 가져오기
import { togglePostLikeStatus } from '@/actions/posts'; // 좋아요 상태를 토글하는 함수 가져오기

// 개별 포스트 컴포넌트
function Post({ post }) {
  return (
    <article className="post">
      <div className="post-image">
        <img src={post.image} alt={post.title} /> {/* 포스트 이미지 */}
      </div>
      <div className="post-content">
        <header>
          <div>
            <h2>{post.title}</h2> {/* 포스트 제목 */}
            <p>
              Shared by {post.userFirstName} on{' '}
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)} {/* 포스트 작성 날짜 */}
              </time>
            </p>
          </div>
          <div>
            <form action={togglePostLikeStatus.bind(null, post.id)} className={post.isLiked ? 'liked' : ''}>
              <LikeButton /> {/* 좋아요 버튼 */}
            </form>
          </div>
        </header>
        <p>{post.content}</p> {/* 포스트 내용 */}
      </div>
    </article>
  );
}

// 포스트 목록 컴포넌트
export default function Posts({ posts }) {
  // 낙관적 UI 업데이트를 위한 상태와 업데이트 함수 정의
  const [optimisticPosts, updateOptimisticPosts] = useOptimistic(posts, (prevPosts, updatedPostId) => {
    // 업데이트할 포스트의 인덱스를 찾기
    const updatedPostIndex = prevPosts.findIndex(post => post.id === updatedPostId);

    // 포스트가 목록에 없으면 이전 상태를 그대로 반환
    if (updatedPostIndex === -1) {
      return prevPosts;
    }

    // 포스트의 좋아요 상태를 변경하여 새로운 상태로 업데이트
    const updatedPost = { ...prevPosts[updatedPostIndex] };
    updatedPost.likes = updatedPost.likes + (updatedPost.isLiked ? -1 : 1);
    updatedPost.isLiked = !updatedPost.isLiked;
    const newPosts = [...prevPosts];
    newPosts[updatedPostIndex] = updatedPost;
    return newPosts;
  });

  // 포스트가 없을 때 표시할 메시지
  if (!optimisticPosts || optimisticPosts.length === 0) {
    return <p>There are no posts yet. Maybe start sharing some?</p>;
  }

  // 좋아요 상태를 업데이트하는 함수
  async function updatedPost(postId) {
    updateOptimisticPosts(postId); // 낙관적 업데이트 실행
    await togglePostLikeStatus(postId); // 실제 서버에 좋아요 상태 토글 요청
  }

  // 포스트 목록 렌더링
  return (
    <ul className="posts">
      {optimisticPosts.map((post) => (
        <li key={post.id}>
          <Post post={post} action={updatedPost} /> {/* 개별 포스트 컴포넌트 */}
        </li>
      ))}
    </ul>
  );
}
