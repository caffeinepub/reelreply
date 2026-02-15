import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Outcall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type InstagramCredentials = {
    igUserId : Text;
    pageId : Text;
    accessToken : Text;
    validated : Bool;
    lastValidation : ?Int;
  };

  type AutomationSettings = {
    keyword : Text;
    autoReplyMessage : Text;
    automationEnabled : Bool;
  };

  type CommentReplyLog = {
    replyId : Text;
    commentId : Text;
    commentSnippet : Text;
    timestamp : Int;
    keywordMatched : Text;
    replyMessage : Text;
    status : Bool;
    errorDetails : ?Text;
    user : Principal;
  };

  type UserProfile = {
    name : Text;
    credentials : ?InstagramCredentials;
    automation : ?AutomationSettings;
  };

  let commentReplyLogs = Map.empty<Text, CommentReplyLog>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let processedComments = Map.empty<Text, Int>(); // For idempotency

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Instagram credentials management
  public shared ({ caller }) func validateCredentials(credentials : InstagramCredentials) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can validate credentials");
    };

    let validatedCredentials = {
      credentials with
      validated = true;
      lastValidation = ?Time.now();
    };

    let existingProfile = switch (userProfiles.get(caller)) {
      case (null) {
        {
          name = "";
          credentials = null;
          automation = null;
        };
      };
      case (?profile) { profile };
    };

    let updatedProfile = {
      existingProfile with
      credentials = ?validatedCredentials;
    };

    userProfiles.add(caller, updatedProfile);
    true;
  };

  public shared ({ caller }) func updateAutomationSettings(settings : AutomationSettings) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update automation settings");
    };

    let existingProfile = switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("Profile not found. Please validate credentials first.");
      };
      case (?profile) { profile };
    };

    let updatedProfile = {
      existingProfile with
      automation = ?settings;
    };

    userProfiles.add(caller, updatedProfile);
    true;
  };

  public query ({ caller }) func getAutomationSettings() : async ?AutomationSettings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view automation settings");
    };

    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { profile.automation };
    };
  };

  public query ({ caller }) func getCredentials() : async ?InstagramCredentials {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view credentials");
    };

    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { profile.credentials };
    };
  };

  // Reply logs - user can only see their own logs
  public query ({ caller }) func getReplyLogs() : async [CommentReplyLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reply logs");
    };

    let logsIter = commentReplyLogs.values();
    let userLogs = logsIter.filter(func(log : CommentReplyLog) : Bool {
      log.user == caller;
    });
    userLogs.toArray();
  };

  public query ({ caller }) func getReplyStatistics() : async {
    totalReplies : Nat;
    successfulReplies : Nat;
    keywordCounts : [(Text, Nat)];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view statistics");
    };

    let logs = commentReplyLogs.values();
    let userLogs = logs.filter(func(log : CommentReplyLog) : Bool {
      log.user == caller;
    });

    let totalReplies = userLogs.size();
    let successfulReplies = userLogs.filter(func(log) { log.status }).size();

    let keywordCountsArray = userLogs.foldLeft([], func(acc : [(Text, Nat)], log : CommentReplyLog) : [(Text, Nat)] {
      switch (acc.find(func((keyword, _)) { keyword == log.keywordMatched })) {
        case (null) {
          acc.concat([(log.keywordMatched, 1)]);
        };
        case (?_) {
          acc.map(
            func((keyword, count)) {
              if (keyword == log.keywordMatched) { (keyword, count + 1) } else {
                (keyword, count);
              };
            }
          );
        };
      };
    });

    {
      totalReplies;
      successfulReplies;
      keywordCounts = keywordCountsArray;
    };
  };

  public query ({ caller }) func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  // Webhook handler - internal function, not directly callable by users
  func handleCommentEventInternal(
    principalId : Principal,
    commentId : Text,
    commentText : Text,
    commentSnippet : Text,
    timestamp : Int,
  ) : async Bool {
    // Check for idempotency - avoid duplicate replies
    switch (processedComments.get(commentId)) {
      case (?_) {
        return false; // Already processed
      };
      case (null) {};
    };

    let profile = switch (userProfiles.get(principalId)) {
      case (null) {
        return false; // No profile found
      };
      case (?p) { p };
    };

    let automation = switch (profile.automation) {
      case (null) { return false };
      case (?a) { a };
    };

    let credentials = switch (profile.credentials) {
      case (null) { return false };
      case (?c) { c };
    };

    if (not automation.automationEnabled) {
      return false;
    };

    if (not credentials.validated) {
      return false;
    };

    // Check if comment contains keyword
    let commentLower = commentText.toLower();
    let keywordLower = automation.keyword.toLower();

    if (not commentLower.contains(#text keywordLower)) {
      return false;
    };

    let replyId = Int.toText(timestamp) # "-" # commentId;

    // Mark as processed for idempotency
    processedComments.add(commentId, timestamp);

    let url = "https://graph.facebook.com/v17.0/" # commentId # "/replies";
    let headers = [
      {
        name = "Authorization";
        value = "Bearer " # credentials.accessToken;
      },
      {
        name = "Content-Type";
        value = "application/json";
      },
    ];

    let body = "{\"message\":\"" # automation.autoReplyMessage # "\"}";
    let bodyBlob = body.encodeUtf8();

    try {
      let response = await Outcall.httpPostRequest(
        url,
        headers,
        body,
        transform,
      );

      let replyLog = {
        replyId;
        commentId;
        commentSnippet;
        timestamp;
        keywordMatched = automation.keyword;
        replyMessage = automation.autoReplyMessage;
        status = true;
        errorDetails = null;
        user = principalId;
      };

      commentReplyLogs.add(replyId, replyLog);
      true;
    } catch (e) {
      let replyLog = {
        replyId;
        commentId;
        commentSnippet;
        timestamp;
        keywordMatched = automation.keyword;
        replyMessage = automation.autoReplyMessage;
        status = false;
        errorDetails = ?("Failed to send reply: " # Error.message(e));
        user = principalId;
      };

      commentReplyLogs.add(replyId, replyLog);
      false;
    };
  };

  // Admin-only functions
  public query ({ caller }) func getAllUsers() : async [Principal] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    let users = userProfiles.keys();
    users.toArray();
  };

  public query ({ caller }) func getAllReplyLogs() : async [CommentReplyLog] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all logs");
    };

    let logsIter = commentReplyLogs.values();
    logsIter.toArray();
  };

  // Helper functions for signature validation
  func verifySignature(payload : Blob, signature : Blob) : Bool {
    // Implement proper HMAC-SHA256 signature verification
    // This is a stub - actual implementation would use crypto libraries
    true;
  };
};
