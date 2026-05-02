import { Router, Request, Response } from 'express';
import { Part } from '../models/Part';
import { Movement } from '../models/Movement';
import { logger } from '../services/stream.service';
import { requireManager } from '../middleware/auth';

const router = Router();

/**
 * DELETE /api/data/reset
 * Clears all data from the database (Parts and Movements)
 */
router.delete('/reset', requireManager, async (req: Request, res: Response) => {
    try {
        logger.info('Reset data requested');

        // Delete all movements
        const deletedMovements = await Movement.deleteMany({});
        logger.info({ count: deletedMovements.deletedCount }, 'Movements deleted');

        // Delete all parts
        const deletedParts = await Part.deleteMany({});
        logger.info({ count: deletedParts.deletedCount }, 'Parts deleted');

        res.json({
            success: true,
            message: 'All data has been reset',
            deletedParts: deletedParts.deletedCount,
            deletedMovements: deletedMovements.deletedCount,
        });
    } catch (error) {
        logger.error({ error }, 'Error resetting data');
        throw error;
    }
});

export default router;
