import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { followers, sessions, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { calculateCompletionPercentage, updateChecklist } from '@/models/user';
import { z } from 'zod';

// Extend the Express Request type to include the `email` field
interface ExtendedRequest extends Request {
  email?: string;
}

const deleteAccount = async (
  req: ExtendedRequest,
  res: Response
): Promise<void> => {
  const email = req.body.email;
  try {
    const rowsDeleted = await db.delete(users).where(eq(users.email, email));

    if (rowsDeleted.rowCount === 0) {
      // If no rows were deleted, send a 404 response
      res.status(404).json({ message: 'User not found' });
    } else {
      // If deletion was successful, send a 200 response
      res.status(200).json({ message: 'Account deleted successfully' });
    }
  } catch (error) {
    // Handle any other errors that may have occurred
    console.error('Error deleting account:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while deleting the account' });
  }
};

const updateProfileSchema = z.object({
  gender: z.string().optional(),
  username: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  street: z.string().optional(),
  date_of_birth: z.string().optional(),
  city: z.string().optional(),
  new_password: z.string().optional(),
});

const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.session_id, req.sessionID),
    with: {
      user: true,
    },
  });

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const {
      gender,
      username,
      phone,
      country,
      state,
      street,
      date_of_birth,
      city,
      new_password,
    } = updateProfileSchema.parse(req.body);

    if (!session.user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if there's a new image
    let newImage = null;
    if (req.file) {
      // If the user has an old profile image, delete it from the server
      if (session.user.image) {
        const oldImagePath = path.join(
          __dirname,
          '../uploads/image',
          path.basename(session.user.image)
        );
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Error deleting old image:', err);
        });
      }

      // Set the new image path
      newImage = `/api/uploads/image/${req.file.filename}`;
    }

    // Prepare the updated fields, only including provided values
    const updatedFields: Partial<typeof session.user> = {
      ...(gender && { gender }),
      ...(username && { username }),
      ...(phone && { phone }),
      ...(country && { country }),
      ...(state && { state }),
      ...(street && { street }),
      ...(date_of_birth && { date_of_birth }),
      ...(city && { city }),
    };

    // If a new password is provided, hash it and add it to the update object
    if (new_password) {
      updatedFields.password = await bcrypt.hash(new_password, 10);
    }

    // Set the image if a new one is uploaded; otherwise, keep the existing image
    updatedFields.image = newImage || session.user.image;

    // // Update the user with the specified fields
    // await user.update(updatedFields);
    // user.updateChecklist();
    // user.completionPercentage = user.calculateCompletionPercentage();

    // // Save the updated profile completion
    // await user.save();

    // Update the user with the specified fields
    console.log(updatedFields);
    updateChecklist(session.user);
    session.user.completionPercentage = calculateCompletionPercentage(
      session.user
    );

    // Send the updated user details and profile completion
    const updatedUser = await db
      .update(users)
      .set({
        ...updatedFields,
        completionPercentage: session.user.completionPercentage,
        checklist: session.user.checklist,
      })
      .where(eq(users.email, session.user.email))
      .returning();

    if (!updatedUser.length) {
      res.status(500).json({ message: 'Failed to update user details' });
      return;
    }

    res.status(201).json({
      message: 'User details updated successfully',
      user: updatedUser[0],
      profileCompletion: {
        percentage: updatedUser[0].completionPercentage,
        checklist: updatedUser[0].checklist,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserDetails = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.params.id); // Ensure the ID is parsed as a number

  if (!userId) {
    res.status(400).json({ message: 'User Id is required' });
    return;
  }

  try {
    // Fetch user data from the database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const userDetails = user[0];

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.session_id, req.sessionID),
      with: {
        user: true,
      },
    });

    // Prepare the response
    const response = {
      id: userDetails.id,
      email: userDetails.email,
      username: userDetails.username,
      phone: userDetails.phone,
      country: userDetails.country,
      state: userDetails.state,
      city: userDetails.city,
      street: userDetails.street,
      image: userDetails.image,
      gender: userDetails.gender,
      dateOfBirth: userDetails.date_of_birth,
    };
    if (session) {
      // Check if the requesting user is following this user
      const isFollowing = await db.query.followers.findFirst({
        where: and(
          eq(followers.followerId, session.user.id),
          eq(followers.followedId, userId)
        ),
      });

      res.status(200).json({
        ...response,
        isFollowing: !!isFollowing, // Convert to boolean
      });
      return;
    }

    res.status(200).json(response);
    return;
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

export default {
  deleteAccount,
  updateProfile,
  getUserDetails,
};
