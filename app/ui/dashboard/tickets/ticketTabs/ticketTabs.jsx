"use client";

import { useState } from "react";
import styles from "./ticketTabs.module.css";
import UpdateTicketForm from "../updateTicketForm";
import AddReply from "../../comments/comments";
import AttachmentsList from "../attachments/attachments";
import UploadAttachment from "../attachments/uploadAttachment";
import { FaTicketAlt, FaComments, FaPaperclip, FaRegCommentDots } from "react-icons/fa";

const TicketTabs = ({ ticket, users, isLRGVDC, session, replies = [] }) => {
  const [activeTab, setActiveTab] = useState("details");

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return (
          <div className={styles.tabPanel}>
            <UpdateTicketForm
              ticket={ticket}
              users={users}
              isLRGVDC={isLRGVDC}
              session={session}
            />
          </div>
        );
      case "discussion":
        return (
          <div className={`${styles.tabPanel} ${styles.discussionPanel}`}>
            <div className={styles.discussionContainer}>
              <div className={styles.repliesSection}>
                <div className={styles.repliesHeader}>
                  <div className={styles.headerMain}>
                    <h3>Discussion Thread</h3>
                    <span className={styles.repliesCount}>
                      {replies.length} {replies.length === 1 ? 'response' : 'responses'}
                    </span>
                  </div>
                </div>

                {replies.length === 0 ? (
                  <div className={styles.noReplies}>
                    <FaRegCommentDots className={styles.noRepliesIcon} />
                    <p>No responses yet</p>
                    <span>Share your thoughts or provide assistance by adding a response below.</span>
                  </div>
                ) : (
                  <div className={styles.repliesList}>
                    {replies.map((reply) => {
                      const replyUser = users.find(u => u._id === reply.user?._id) || {};
                      
                      return (
                        <div key={reply._id} className={styles.reply}>
                          <div className={styles.replyGrid}>
                            <div className={styles.replyAuthor}>
                              <div className={styles.userAvatar}>
                                {(replyUser.username || 'U')[0].toUpperCase()}
                              </div>
                              <div className={styles.authorInfo}>
                                <span className={styles.userName}>
                                  {replyUser.username || reply.user?.username || "Unknown User"}
                                </span>
                                <span className={styles.userRole}>
                                  Team Member
                                </span>
                              </div>
                            </div>
                            
                            <div className={styles.replyMain}>
                              <div className={styles.replyMeta}>
                       
                                <span className={styles.replyDate}>
                                  Posted on {formatDate(reply.createdAt)}
                                </span>
                              </div>
                              <div 
                                className={styles.replyContent}
                                dangerouslySetInnerHTML={{ __html: reply.text }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className={styles.replyComposer}>
                <div className={styles.composerHeader}>
                  <h4>Add Your Response</h4>
                </div>
                <AddReply
                  ticketID={ticket._id}
                  user={session.user.id}
                />
              </div>
            </div>
          </div>
        );
      case "attachments":
        return (
          <div className={styles.tabPanel}>
            <UploadAttachment ticketId={ticket._id} />
            <AttachmentsList
              attachments={ticket.attachments}
              ticketId={ticket._id}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabList}>
        <button
          className={`${styles.tab} ${activeTab === "details" ? styles.active : ""}`}
          onClick={() => handleTabClick("details")}
        >
          <FaTicketAlt className={styles.icon} /> Ticket Details
        </button>
        <button
          className={`${styles.tab} ${activeTab === "discussion" ? styles.active : ""}`}
          onClick={() => handleTabClick("discussion")}
        >
          <FaComments className={styles.icon} /> Discussion
          {replies.length > 0 && (
            <span className={styles.count}>{replies.length}</span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === "attachments" ? styles.active : ""}`}
          onClick={() => handleTabClick("attachments")}
        >
          <FaPaperclip className={styles.icon} /> Attachments
          {ticket.attachments?.length > 0 && (
            <span className={styles.count}>{ticket.attachments.length}</span>
          )}
        </button>
      </div>
      {renderTabContent()}
    </div>
  );
};

export default TicketTabs;
