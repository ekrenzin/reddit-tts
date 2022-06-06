import { Comment } from './Comment'
import { RedditComment } from '../Video';


export const CommentQueue: React.FC<{
  comments: Array<RedditComment>;
  startFrom: number;
}> = ({ comments, startFrom }) => {

  const commentDivs = () => {
    let commentComponents: Array<JSX.Element> = []
    let startAt = startFrom
    for (const comment of comments) {
      const endAt = Math.round((comment.duration) * 30) + startAt
      commentComponents.push(<Comment key={comment.message} message={comment.message} upvotes={comment.upvotes} author={comment.name} url={comment.url} startFrame={startAt} endFrame={endAt} />)
      startAt = endAt
    }
    return commentComponents
  }

  return (
    <>
      <div style={{ flex: 1 }}>
        {commentDivs()}
      </div>
    </>
  );
};
