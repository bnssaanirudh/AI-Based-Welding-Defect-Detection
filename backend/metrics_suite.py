import numpy as np
import torch


def calculate_iou(pred, target, n_classes=4):
    """
    Intersection over Union (IoU) calculation for research metrics.
    """
    ious = []
    pred = pred.view(-1)
    target = target.view(-1)

    for cls in range(n_classes):
        pred_inds = pred == cls
        target_inds = target == cls
        intersection = (pred_inds[target_inds]).long().sum().item()
        union = pred_inds.long().sum().item() + target_inds.long().sum().item() - intersection
        if union == 0:
            ious.append(float("nan"))  # If there is no ground truth, do not include in mean
        else:
            ious.append(float(intersection) / float(max(union, 1)))
    return ious


def calculate_dice(pred, target, n_classes=4):
    """
    Dice Coefficient (F1-Score for Segmentation).
    """
    dices = []
    pred = pred.view(-1)
    target = target.view(-1)

    for cls in range(n_classes):
        pred_inds = pred == cls
        target_inds = target == cls
        intersection = (pred_inds[target_inds]).long().sum().item()
        sum_total = pred_inds.long().sum().item() + target_inds.long().sum().item()
        if sum_total == 0:
            dices.append(float("nan"))
        else:
            dices.append(2.0 * float(intersection) / float(max(sum_total, 1)))
    return dices


def get_research_metrics(pred_mask, gt_mask, n_classes=4):
    """
    Comprehensive research metrics suite.
    """
    ious = calculate_iou(pred_mask, gt_mask, n_classes)
    dices = calculate_dice(pred_mask, gt_mask, n_classes)

    return {
        "miou": np.nanmean(ious),
        "mean_dice": np.nanmean(dices),
        "class_ious": ious,
        "class_dices": dices,
    }
