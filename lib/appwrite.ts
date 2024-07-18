import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  ImageGravity,
  Query,
  Storage,
} from "react-native-appwrite";

import { ImagePickerAsset } from "expo-image-picker";
import { appwriteConfig } from "./appwriteConfig";

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
} = appwriteConfig;

// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
  .setProject(appwriteConfig.projectId) // Your project ID
  .setPlatform(appwriteConfig.platform); // Your application ID or bundle ID.

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (
  email: string,
  password: string,
  username: string
) => {
  // Register User
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) {
      throw Error;
    }

    const avatarUrl = avatars.getInitials(username);
    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      { accountId: newAccount.$id, email, username, avatar: avatarUrl }
    );

    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error((<Error>error).message);
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const session = account.createEmailPasswordSession(email, password);

    return session;
  } catch (error) {
    console.log(error);
    throw new Error((<Error>error).message);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) {
      throw Error;
    }
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) {
      throw Error;
    }
    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt"),
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error((<Error>error).message);
  }
};

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt"),
      Query.limit(7),
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error((<Error>error).message);
  }
};

export const searchPosts = async (query: string) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.search("title", query),
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error((<Error>error).message);
  }
};

export const getUserPosts = async (userId: string) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.equal("creator", userId),
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error((<Error>error).message);
  }
};

export const signout = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    throw new Error((<Error>error).message);
  }
};

export const getFilePreview = (fileId: string, type: "image" | "video") => {
  let fileUrl;
  try {
    if (type === "video") {
      fileUrl = storage.getFileView(storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        storageId,
        fileId,
        2000,
        2000,
        "top" as ImageGravity,
        100
      );
    } else {
      throw new Error("Invalid File Type");
    }

    if (!fileUrl) {
      throw Error;
    }
    return fileUrl;
  } catch (error) {
    throw new Error((<Error>error).message);
  }
};
export const uploadFile = async (
  file: ImagePickerAsset | null,
  type: "image" | "video"
) => {
  if (!file) {
    return;
  }

  const { mimeType, fileSize, fileName, ...rest } = file;

  const asset = {
    type: mimeType || "",
    size: fileSize || 0,
    name: fileName || "",
    ...rest,
  };

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );

    const fileUrl = getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    throw new Error((<Error>error).message);
  }
};
export const createVideo = async (
  form: {
    title: string;
    video: ImagePickerAsset | null;
    thumbnail: ImagePickerAsset | null;
    prompt: string;
  },
  userId: string
) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      databaseId,
      videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error((<Error>error).message);
  }
};

export const likeVideo = async (videoDocumentId: string, userId: string) => {
  try {
    const video = await databases.getDocument(databaseId, videoCollectionId, videoDocumentId);

    const result = await databases.updateDocument(databaseId, videoCollectionId, videoDocumentId, {
      likedBy: [...video.likedBy, userId]
    })

    return result;

  } catch (error) {
    throw new Error((<Error>error).message);
  }
}


export const unlikeVideo = async (videoDocumentId: string, userId: string) => {
  try {
    const video = await databases.getDocument(databaseId, videoCollectionId, videoDocumentId);

    const updatedLikedBy = [...video.likedBy].filter((id) => id != userId);
    const result = await databases.updateDocument(databaseId, videoCollectionId, videoDocumentId, {
      likedBy: updatedLikedBy
    })

    return result;

  } catch (error) {
    throw new Error((<Error>error).message);
  }
}

export const getLikedVideosByUser = async (userId: string) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.contains('likedBy', userId),
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error((<Error>error).message);
  }
};