import React, {useContext, useMemo, useRef, useState} from 'react';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import {navigationRef} from '@libs/Navigation/Navigation';
import {close} from '@userActions/Modal';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type SearchRouterContext = {
    isSearchRouterDisplayed: boolean;
    openSearchRouter: () => void;
    closeSearchRouter: () => void;
    toggleSearch: () => void;
    registerSearchPageInput: (ref: AnimatedTextInputRef) => void;
    unregisterSearchPageInput: () => void;
};

const defaultSearchContext: SearchRouterContext = {
    isSearchRouterDisplayed: false,
    openSearchRouter: () => {},
    closeSearchRouter: () => {},
    toggleSearch: () => {},
    registerSearchPageInput: () => {},
    unregisterSearchPageInput: () => {},
};

const Context = React.createContext<SearchRouterContext>(defaultSearchContext);

function SearchRouterContextProvider({children}: ChildrenProps) {
    const [isSearchRouterDisplayed, setIsSearchRouterDisplayed] = useState(false);
    const searchRouterDisplayedRef = useRef(false);
    const searchPageInputRef = useRef<AnimatedTextInputRef | undefined>(undefined);

    const routerContext = useMemo(() => {
        const openSearchRouter = () => {
            close(
                () => {
                    setIsSearchRouterDisplayed(true);
                    searchRouterDisplayedRef.current = true;
                },
                false,
                true,
            );
        };
        const closeSearchRouter = () => {
            setIsSearchRouterDisplayed(false);
            searchRouterDisplayedRef.current = false;
        };

        // There are callbacks that live outside of React render-loop and interact with SearchRouter
        // So we need a function that is based on ref to correctly open/close it
        // When user is on `/search` page we focus the Input instead of showing router
        const toggleSearch = () => {
            const searchFullScreenRoutes = navigationRef.getRootState()?.routes.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
            const lastRoute = searchFullScreenRoutes?.state?.routes?.at(-1);
            const isUserOnSearchPage = isSearchTopmostFullScreenRoute() && lastRoute?.name === SCREENS.SEARCH.ROOT;

            if (isUserOnSearchPage && searchPageInputRef.current) {
                if (searchPageInputRef.current.isFocused()) {
                    searchPageInputRef.current.blur();
                } else {
                    searchPageInputRef.current.focus();
                }
            } else if (searchRouterDisplayedRef.current) {
                closeSearchRouter();
            } else {
                openSearchRouter();
            }
        };

        const registerSearchPageInput = (ref: AnimatedTextInputRef) => {
            searchPageInputRef.current = ref;
        };

        const unregisterSearchPageInput = () => {
            searchPageInputRef.current = undefined;
        };

        return {
            isSearchRouterDisplayed,
            openSearchRouter,
            closeSearchRouter,
            toggleSearch,
            registerSearchPageInput,
            unregisterSearchPageInput,
        };
    }, [isSearchRouterDisplayed, setIsSearchRouterDisplayed]);

    return <Context.Provider value={routerContext}>{children}</Context.Provider>;
}

function useSearchRouterContext() {
    return useContext(Context);
}

SearchRouterContextProvider.displayName = 'SearchRouterContextProvider';

export {SearchRouterContextProvider, useSearchRouterContext};
