import React, {useCallback, useEffect} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchContext} from '@components/Search/SearchContext';
import useLocalize from '@hooks/useLocalize';
import {clearErrorFields, clearErrors} from '@libs/actions/FormActions';
import {holdMoneyRequestOnSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import HoldReasonFormView from '@pages/iou/HoldReasonFormView';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';

type SearchHoldReasonPageRouteParams = {
    /** Link to previous page */
    backTo: Route;
};

type SearchHoldReasonPageProps = {
    /** Navigation route context info provided by react navigation */
    route: PlatformStackRouteProp<{params?: SearchHoldReasonPageRouteParams}>;
};

function SearchHoldReasonPage({route}: SearchHoldReasonPageProps) {
    const {translate} = useLocalize();

    const {currentSearchHash, selectedTransactions, clearSelectedTransactions} = useSearchContext();
    const {backTo = ''} = route.params ?? {};

    const selectedTransactionIDs = Object.keys(selectedTransactions);
    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
        holdMoneyRequestOnSearch(currentSearchHash, selectedTransactionIDs, values.comment);
        clearSelectedTransactions();
        Navigation.goBack();
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM> = getFieldRequiredErrors(values, [INPUT_IDS.COMMENT]);

            if (!values.comment) {
                errors.comment = translate('common.error.fieldRequired');
            }

            return errors;
        },
        [translate],
    );

    useEffect(() => {
        clearErrors(ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM);
        clearErrorFields(ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM);
    }, []);

    return (
        <HoldReasonFormView
            onSubmit={onSubmit}
            validate={validate}
            backTo={backTo}
        />
    );
}

SearchHoldReasonPage.displayName = 'SearchHoldReasonPage';

export default SearchHoldReasonPage;
