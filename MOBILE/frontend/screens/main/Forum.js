import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const discussions = [
  {
    id: "1",
    user: "John Doe",
    message: "Hey everyone! How do I sign 'Good Morning' in ASL?",
    timestamp: "2 hours ago",
    comments: [
      {
        id: "1",
        user: "Jane Smith",
        message:
          "You start with a flat hand near your chin and move it outward. Like this! 👋",
        timestamp: "1 hour ago",
      },
      {
        id: "2",
        user: "Alice Johnson",
        message: "Thanks, Jane! That was really helpful.",
        timestamp: "45 minutes ago",
      },
    ],
  },
  {
    id: "2",
    user: "Bob Brown",
    message: "Does anyone know a good resource for learning ASL grammar?",
    timestamp: "30 minutes ago",
    comments: [],
  },
];

const Forum = () => {
  const [newComment, setNewComment] = useState("");
  const [activeDiscussionId, setActiveDiscussionId] = useState(null);

  const handleAddComment = (discussionId) => {
    if (newComment.trim()) {
      const discussion = discussions.find((d) => d.id === discussionId);
      if (discussion) {
        discussion.comments.push({
          id: Date.now().toString(),
          user: "You",
          message: newComment,
          timestamp: "Just now",
        });
        setNewComment("");
        setActiveDiscussionId(null);
      }
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {discussions.map((discussion) => (
        <View key={discussion.id} style={styles.discussionItem}>
          <Text style={styles.userName}>{discussion.user}</Text>
          <Text style={styles.message}>{discussion.message}</Text>
          <Text style={styles.timestamp}>{discussion.timestamp}</Text>
          
          {/* Display Comments */}
          {discussion.comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Text style={styles.commentUserName}>{comment.user}</Text>
              <Text style={styles.commentMessage}>{comment.message}</Text>
              <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
            </View>
          ))}
          
          {/* Add Comment Input */}
          {activeDiscussionId === discussion.id ? (
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity
                style={styles.commentButton}
                onPress={() => handleAddComment(discussion.id)}
              >
                <Text style={styles.commentButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addCommentButton}
              onPress={() => setActiveDiscussionId(discussion.id)}
            >
              <Text style={styles.addCommentButtonText}>Add a Comment</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#374ef5",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 90, // Add padding to account for the bottom tab bar
  },
  discussionItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  message: {
    fontSize: 14,
    color: "#666",
    marginVertical: 8,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  commentItem: {
    marginLeft: 16,
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  commentMessage: {
    fontSize: 14,
    color: "#666",
  },
  commentTimestamp: {
    fontSize: 12,
    color: "#999",
  },
  addCommentButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#ffb702", // Yellow button
    borderRadius: 8,
    alignItems: "center",
  },
  addCommentButtonText: {
    color: "#374ef5",
    fontWeight: "bold",
  },
  commentInputContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginRight: 8,
  },
  commentButton: {
    padding: 8,
    backgroundColor: "#374ef5", // Yellow button
    borderRadius: 8,
    alignItems: "center",
  },
  commentButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
});

export default Forum;
